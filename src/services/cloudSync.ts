/**
 * Cloud Sync Service (Turso)
 *
 * Implements safe, atomic, optimistic concurrency cloud synchronization
 * with local metadata tracking, conflict resolution, offline retry, and user scoping.
 */

export interface TursoClientLike {
  execute(stmt: string | { sql: string; args?: any[] }): Promise<{
    rows?: any[];
    rowsAffected?: number;
  }>;
  batch(
    stmts: Array<string | { sql: string; args?: any[] }>,
    mode?: 'write' | 'read' | 'deferred'
  ): Promise<Array<{
    rows?: any[];
    rowsAffected?: number;
  }>>;
}

export type CloudSyncStatus = 'synced' | 'syncing' | 'error' | 'offline';

export const SYNC_COLLECTIONS = [
  'accounts',
  'transactions',
  'categories',
  'budgets',
  'goals',
  'debts',
  'cheques',
  'persons',
  'assets',
  'assetTransactions',
  'currency',
  'themeConfig',
  'dashboardConfig',
] as const;

export type SyncCollectionKey = (typeof SYNC_COLLECTIONS)[number];

export interface CollectionSyncMeta {
  dirty: boolean;
  baseRemoteUpdatedAt: string | null;
  localModifiedAt: string;
}

export type UserSyncMetadata = Record<string, CollectionSyncMeta>;

export const SYNC_META_KEY_PREFIX = 'pf_sync_meta_';
export const CONFLICT_BACKUP_KEY_PREFIX = 'pf_conflict_backup_';

/**
 * Get localStorage key for a user's sync metadata
 */
export function getUserSyncMetaKey(userId: string): string {
  return `${SYNC_META_KEY_PREFIX}${userId}`;
}

/**
 * Synchronously determine if an authenticated user session is active
 */
export function getInitialAuthUserId(): string | null {
  try {
    if (typeof localStorage === 'undefined') return null;
    const isRemember = localStorage.getItem('pf_auth_remember_v1') === 'true';
    const storage =
      isRemember
        ? localStorage
        : typeof sessionStorage !== 'undefined'
        ? sessionStorage
        : localStorage;
    const storedUser = storage.getItem('pf_auth_user_v1');
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      return parsed.id || null;
    }
  } catch {
    // ignore
  }
  return null;
}

/**
 * Load user sync metadata from localStorage
 */
export function loadUserSyncMeta(userId: string): UserSyncMetadata {
  try {
    if (typeof localStorage === 'undefined') return {};
    const raw = localStorage.getItem(getUserSyncMetaKey(userId));
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Error reading sync meta for user:', userId, e);
  }
  return {};
}

/**
 * Save user sync metadata to localStorage
 */
export function saveUserSyncMeta(userId: string, meta: UserSyncMetadata): void {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(getUserSyncMetaKey(userId), JSON.stringify(meta));
  } catch (e) {
    console.warn('Error saving sync meta for user:', userId, e);
  }
}

/**
 * Mark a collection as dirty synchronously
 */
export function markCollectionDirty(userId: string, collection: string): void {
  const meta = loadUserSyncMeta(userId);
  const current = meta[collection] || {
    dirty: false,
    baseRemoteUpdatedAt: null,
    localModifiedAt: '',
  };
  meta[collection] = {
    ...current,
    dirty: true,
    localModifiedAt: new Date().toISOString(),
  };
  saveUserSyncMeta(userId, meta);
}

/**
 * Save the losing version in a conflict to localStorage (keeps 5 newest per user/collection)
 */
export function saveConflictBackup(
  userId: string,
  collection: string,
  losingData: any
): void {
  try {
    if (typeof localStorage === 'undefined') return;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupKey = `${CONFLICT_BACKUP_KEY_PREFIX}${userId}_${collection}_${timestamp}`;
    localStorage.setItem(
      backupKey,
      JSON.stringify({
        userId,
        collection,
        timestamp: new Date().toISOString(),
        data: losingData,
      })
    );

    // Keep only the 5 newest backups
    const prefix = `${CONFLICT_BACKUP_KEY_PREFIX}${userId}_${collection}_`;
    const matchingKeys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        matchingKeys.push(key);
      }
    }

    if (matchingKeys.length > 5) {
      matchingKeys.sort();
      const toRemove = matchingKeys.slice(0, matchingKeys.length - 5);
      for (const k of toRemove) {
        localStorage.removeItem(k);
      }
    }
  } catch (e) {
    console.warn('Failed to save conflict backup:', e);
  }
}

/**
 * Collections that are merged by item ID (union)
 */
const ID_UNION_COLLECTIONS = new Set<string>([
  'transactions',
  'debts',
  'cheques',
  'assetTransactions',
]);

/**
 * Merge local and remote versions of a collection (Section E)
 */
export function mergeCollectionData(
  collection: string,
  localData: any,
  remoteData: any,
  localModifiedAt: string,
  remoteUpdatedAt: string
): { mergedData: any; losingData: any } {
  const localIsNewer = (localModifiedAt || '') >= (remoteUpdatedAt || '');

  if (
    ID_UNION_COLLECTIONS.has(collection) &&
    Array.isArray(localData) &&
    Array.isArray(remoteData)
  ) {
    const remoteMap = new Map<string, any>();
    for (const item of remoteData) {
      if (item && item.id) remoteMap.set(item.id, item);
    }

    const mergedList: any[] = [];
    const seenIds = new Set<string>();

    for (const localItem of localData) {
      if (localItem && localItem.id) {
        seenIds.add(localItem.id);
        const remoteItem = remoteMap.get(localItem.id);
        if (remoteItem) {
          // Present in both: choose side with newer collection timestamp
          mergedList.push(localIsNewer ? localItem : remoteItem);
        } else {
          mergedList.push(localItem);
        }
      } else {
        mergedList.push(localItem);
      }
    }

    for (const remoteItem of remoteData) {
      if (remoteItem && remoteItem.id && !seenIds.has(remoteItem.id)) {
        mergedList.push(remoteItem);
      }
    }

    const losingData = localIsNewer ? remoteData : localData;
    return { mergedData: mergedList, losingData };
  } else {
    // Accounts, goals, assets, categories, budgets, persons, currency, themeConfig, dashboardConfig
    // Take the side with the newer timestamp
    if (localIsNewer) {
      return { mergedData: localData, losingData: remoteData };
    } else {
      return { mergedData: remoteData, losingData: localData };
    }
  }
}

export function isOfflineError(err: any): boolean {
  if (typeof window !== 'undefined' && typeof navigator !== 'undefined' && !navigator.onLine) return true;
  if (!err) return false;
  const msg = (err.message || String(err)).toLowerCase();
  return (
    msg.includes('network') ||
    msg.includes('fetch failed') ||
    msg.includes('failed to fetch') ||
    msg.includes('offline') ||
    msg.includes('connection refused') ||
    msg.includes('timeout')
  );
}

export interface CloudSyncCallbacks {
  getLocalData: (collection: SyncCollectionKey) => any;
  setLocalData: (collection: SyncCollectionKey, data: any) => void;
  onStatusChange: (status: CloudSyncStatus) => void;
  onConflictNotice?: (message: string) => void;
}

const BACKOFF_DELAYS = [2000, 4000, 8000, 16000, 32000, 60000];

export class CloudSyncManager {
  private callbacks: CloudSyncCallbacks;
  private debounceTimer: any = null;
  private retryTimer: any = null;
  private retryCount = 0;
  private isFlushing = false;
  private flushQueued = false;
  private currentUserId: string | null = null;

  constructor(callbacks: CloudSyncCallbacks) {
    this.callbacks = callbacks;
  }

  public setCallbacks(callbacks: CloudSyncCallbacks): void {
    this.callbacks = callbacks;
  }

  public markDirty(collection: SyncCollectionKey): void {
    if (!this.currentUserId) return;
    markCollectionDirty(this.currentUserId, collection);
  }

  /**
   * Schedule debounced flush (single timer for all collections)
   */
  public scheduleFlush(
    userId: string,
    client: TursoClientLike,
    delayMs = 1500
  ): void {
    this.currentUserId = userId;
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    this.debounceTimer = setTimeout(() => {
      this.debounceTimer = null;
      this.flush(userId, client);
    }, delayMs);
  }

  /**
   * Schedule exponential backoff retry on failure
   */
  private scheduleRetry(userId: string, client: TursoClientLike): void {
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
    }
    const delay = BACKOFF_DELAYS[Math.min(this.retryCount, BACKOFF_DELAYS.length - 1)];
    this.retryCount++;
    this.retryTimer = setTimeout(() => {
      this.retryTimer = null;
      this.flush(userId, client);
    }, delay);
  }

  /**
   * Hydrate on login (Section D)
   */
  public async hydrate(userId: string, client: TursoClientLike): Promise<void> {
    this.currentUserId = userId;
    this.callbacks.onStatusChange('syncing');

    let remoteRows: Array<{ collection_key: string; data_json: string; updated_at: string }> = [];
    try {
      const res = await client.execute({
        sql: 'SELECT collection_key, data_json, updated_at FROM user_finance_data WHERE user_id = ?',
        args: [userId],
      });
      if (res && res.rows) {
        remoteRows = res.rows as any[];
      }
    } catch (err: any) {
      console.error('Failed to fetch remote rows during hydration:', err);
      this.callbacks.onStatusChange(isOfflineError(err) ? 'offline' : 'error');
      return;
    }

    const remoteMap = new Map<string, { data_json: string; updated_at: string }>();
    for (const r of remoteRows) {
      remoteMap.set(r.collection_key, { data_json: r.data_json, updated_at: r.updated_at });
    }

    const meta = loadUserSyncMeta(userId);
    let hadConflict = false;
    let hasDirtyToUpload = false;

    for (const col of SYNC_COLLECTIONS) {
      const remote = remoteMap.get(col);
      const colMeta = meta[col] || {
        dirty: false,
        baseRemoteUpdatedAt: null,
        localModifiedAt: '',
      };
      const localData = this.callbacks.getLocalData(col);

      if (remote) {
        let parsedRemote: any;
        try {
          parsedRemote = JSON.parse(remote.data_json);
        } catch (e) {
          console.error('Invalid remote data JSON for', col, e);
          continue;
        }

        if (!colMeta.dirty) {
          // Remote row exists and local is not dirty: take remote, store its updated_at as base
          this.callbacks.setLocalData(col, parsedRemote);
          colMeta.dirty = false;
          colMeta.baseRemoteUpdatedAt = remote.updated_at;
        } else if (colMeta.dirty && colMeta.baseRemoteUpdatedAt === remote.updated_at) {
          // Remote row exists and local is dirty and baseRemoteUpdatedAt equals remote.updated_at: keep local and upload it
          hasDirtyToUpload = true;
        } else if (colMeta.dirty && colMeta.baseRemoteUpdatedAt !== remote.updated_at) {
          // Remote row exists and local is dirty and remote changed since base: conflict (Section E)
          hadConflict = true;
          const { mergedData, losingData } = mergeCollectionData(
            col,
            localData,
            parsedRemote,
            colMeta.localModifiedAt,
            remote.updated_at
          );
          saveConflictBackup(userId, col, losingData);
          this.callbacks.setLocalData(col, mergedData);
          colMeta.dirty = true;
          colMeta.baseRemoteUpdatedAt = remote.updated_at;
          colMeta.localModifiedAt = new Date().toISOString();
          hasDirtyToUpload = true;
        }
      } else {
        // No remote row: keep user-scoped local data if present; otherwise keep empty/default state.
        // Never upload demo/default data for a logged-in user unless explicitly created.
        if (colMeta.dirty) {
          hasDirtyToUpload = true;
        } else {
          colMeta.dirty = false;
          colMeta.baseRemoteUpdatedAt = null;
        }
      }

      meta[col] = colMeta;
    }

    saveUserSyncMeta(userId, meta);

    if (hadConflict) {
      this.callbacks.onConflictNotice?.(
        'اطلاعات تغییریافته در دستگاه دیگر ادغام شد. یک نسخه پشتیبان ذخیره گردید.'
      );
    }

    if (hasDirtyToUpload) {
      await this.flush(userId, client);
    } else {
      this.callbacks.onStatusChange('synced');
    }
  }

  /**
   * Atomic batch upload (Section B, C, E)
   */
  public async flush(userId: string, client: TursoClientLike): Promise<boolean> {
    this.currentUserId = userId;
    if (this.isFlushing) {
      this.flushQueued = true;
      return false;
    }

    this.isFlushing = true;
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }

    try {
      const meta = loadUserSyncMeta(userId);
      const dirtyCols = SYNC_COLLECTIONS.filter(c => meta[c]?.dirty === true);

      if (dirtyCols.length === 0) {
        this.callbacks.onStatusChange('synced');
        return true;
      }

      this.callbacks.onStatusChange('syncing');

      // Pre-check: fetch remote updated_at timestamps
      let remoteRows: Array<{ collection_key: string; updated_at: string }> = [];
      try {
        const res = await client.execute({
          sql: 'SELECT collection_key, updated_at FROM user_finance_data WHERE user_id = ?',
          args: [userId],
        });
        if (res && res.rows) {
          remoteRows = res.rows as any[];
        }
      } catch (err: any) {
        console.error('Flush pre-check fetch error:', err);
        this.callbacks.onStatusChange(isOfflineError(err) ? 'offline' : 'error');
        this.scheduleRetry(userId, client);
        return false;
      }

      const remoteMap = new Map<string, { updated_at: string }>();
      for (const r of remoteRows) {
        remoteMap.set(r.collection_key, { updated_at: r.updated_at });
      }

      // Check if any dirty collection has a conflict
      let hasConflict = false;
      for (const col of dirtyCols) {
        const remote = remoteMap.get(col);
        const base = meta[col]?.baseRemoteUpdatedAt;

        if (remote && base !== null && remote.updated_at !== base) {
          hasConflict = true;
          break;
        }
        if (remote && base === null) {
          hasConflict = true;
          break;
        }
        if (!remote && base !== null) {
          hasConflict = true;
          break;
        }
      }

      if (hasConflict) {
        await this.resolveConflicts(userId, client);
        this.isFlushing = false;
        return this.flush(userId, client);
      }

      // Build atomic conditional write statements
      const nowIso = new Date().toISOString();
      const stmts: Array<{ sql: string; args: any[] }> = [];
      const uploadList: Array<{ col: SyncCollectionKey; newUpdatedAt: string }> = [];

      for (const col of dirtyCols) {
        const colMeta = meta[col];
        const data = this.callbacks.getLocalData(col);
        const dataJson = JSON.stringify(data);
        const newUpdatedAt = nowIso;

        if (colMeta.baseRemoteUpdatedAt !== null) {
          stmts.push({
            sql: `UPDATE user_finance_data
                  SET data_json = ?, updated_at = ?
                  WHERE user_id = ? AND collection_key = ? AND updated_at = ?`,
            args: [dataJson, newUpdatedAt, userId, col, colMeta.baseRemoteUpdatedAt],
          });
        } else {
          stmts.push({
            sql: `INSERT INTO user_finance_data (user_id, collection_key, data_json, updated_at)
                  SELECT ?, ?, ?, ?
                  WHERE NOT EXISTS (
                    SELECT 1 FROM user_finance_data WHERE user_id = ? AND collection_key = ?
                  )`,
            args: [userId, col, dataJson, newUpdatedAt, userId, col],
          });
        }
        uploadList.push({ col, newUpdatedAt });
      }

      let batchResults: Array<{ rowsAffected?: number }> = [];
      try {
        batchResults = await client.batch(stmts, 'write');
      } catch (err: any) {
        console.error('Batch upload execution failed:', err);
        this.callbacks.onStatusChange(isOfflineError(err) ? 'offline' : 'error');
        this.scheduleRetry(userId, client);
        return false;
      }

      // Check rowsAffected: if any is 0, abort batch
      const conflictIndex = batchResults.findIndex(r => (r.rowsAffected ?? 0) === 0);
      if (conflictIndex !== -1) {
        await this.resolveConflicts(userId, client);
        this.isFlushing = false;
        return this.flush(userId, client);
      }

      // Clear dirty flags only after cloud write confirmed
      const latestMeta = loadUserSyncMeta(userId);
      for (const { col, newUpdatedAt } of uploadList) {
        if (latestMeta[col]) {
          latestMeta[col].dirty = false;
          latestMeta[col].baseRemoteUpdatedAt = newUpdatedAt;
        }
      }
      saveUserSyncMeta(userId, latestMeta);

      this.retryCount = 0;
      this.callbacks.onStatusChange('synced');
      return true;
    } finally {
      this.isFlushing = false;
      if (this.flushQueued) {
        this.flushQueued = false;
        this.scheduleFlush(userId, client, 500);
      }
    }
  }

  /**
   * Conflict resolution on remote mismatch
   */
  public async resolveConflicts(
    userId: string,
    client: TursoClientLike
  ): Promise<void> {
    const meta = loadUserSyncMeta(userId);
    let remoteRows: Array<{ collection_key: string; data_json: string; updated_at: string }> = [];
    try {
      const res = await client.execute({
        sql: 'SELECT collection_key, data_json, updated_at FROM user_finance_data WHERE user_id = ?',
        args: [userId],
      });
      if (res && res.rows) {
        remoteRows = res.rows as any[];
      }
    } catch (err) {
      console.error('Failed to fetch remote for conflict resolution:', err);
      return;
    }

    const remoteMap = new Map<string, { data_json: string; updated_at: string }>();
    for (const r of remoteRows) {
      remoteMap.set(r.collection_key, { data_json: r.data_json, updated_at: r.updated_at });
    }

    let mergedAny = false;
    for (const col of SYNC_COLLECTIONS) {
      const colMeta = meta[col];
      if (!colMeta || !colMeta.dirty) continue;

      const remote = remoteMap.get(col);
      if (!remote) continue;

      if (colMeta.baseRemoteUpdatedAt !== remote.updated_at) {
        let parsedRemote: any;
        try {
          parsedRemote = JSON.parse(remote.data_json);
        } catch {
          continue;
        }

        const localData = this.callbacks.getLocalData(col);
        const { mergedData, losingData } = mergeCollectionData(
          col,
          localData,
          parsedRemote,
          colMeta.localModifiedAt,
          remote.updated_at
        );

        saveConflictBackup(userId, col, losingData);
        this.callbacks.setLocalData(col, mergedData);

        colMeta.dirty = true;
        colMeta.baseRemoteUpdatedAt = remote.updated_at;
        colMeta.localModifiedAt = new Date().toISOString();
        meta[col] = colMeta;
        mergedAny = true;
      }
    }

    saveUserSyncMeta(userId, meta);

    if (mergedAny) {
      this.callbacks.onConflictNotice?.(
        'اطلاعات تغییریافته در دستگاه دیگر ادغام شد. یک نسخه پشتیبان ذخیره گردید.'
      );
    }
  }

  /**
   * Pull check for remote updates (Section F)
   */
  public async pullCheck(userId: string, client: TursoClientLike): Promise<void> {
    const meta = loadUserSyncMeta(userId);
    let remoteRows: Array<{ collection_key: string; updated_at: string }> = [];
    try {
      const res = await client.execute({
        sql: 'SELECT collection_key, updated_at FROM user_finance_data WHERE user_id = ?',
        args: [userId],
      });
      if (res && res.rows) remoteRows = res.rows as any[];
    } catch {
      return;
    }

    let hasDirtyConflict = false;
    const colsToPull: SyncCollectionKey[] = [];

    for (const r of remoteRows) {
      const col = r.collection_key as SyncCollectionKey;
      const colMeta = meta[col];
      if (colMeta && colMeta.baseRemoteUpdatedAt !== r.updated_at) {
        if (colMeta.dirty) {
          hasDirtyConflict = true;
        } else {
          colsToPull.push(col);
        }
      }
    }

    if (colsToPull.length > 0) {
      for (const col of colsToPull) {
        try {
          const rowRes = await client.execute({
            sql: 'SELECT data_json, updated_at FROM user_finance_data WHERE user_id = ? AND collection_key = ?',
            args: [userId, col],
          });
          if (rowRes && rowRes.rows && rowRes.rows.length > 0) {
            const row = rowRes.rows[0];
            const parsed = JSON.parse(row.data_json as string);
            this.callbacks.setLocalData(col, parsed);
            if (meta[col]) {
              meta[col].baseRemoteUpdatedAt = row.updated_at as string;
              meta[col].dirty = false;
            }
          }
        } catch (err) {
          console.error('Failed to pull updated col:', col, err);
        }
      }
      saveUserSyncMeta(userId, meta);
    }

    if (hasDirtyConflict) {
      await this.flush(userId, client);
    }
  }

  /**
   * Setup lifecycle listeners for visibilitychange, pagehide, beforeunload, and online
   */
  public setupLifecycle(
    userId: string,
    getClient: () => TursoClientLike | null
  ): () => void {
    this.currentUserId = userId;

    const onVisibilityChange = () => {
      const client = getClient();
      if (!client) return;

      if (document.visibilityState === 'hidden') {
        this.flush(userId, client);
      } else if (document.visibilityState === 'visible') {
        this.pullCheck(userId, client);
      }
    };

    const onPageHide = () => {
      const client = getClient();
      if (client) this.flush(userId, client);
    };

    const onBeforeUnload = () => {
      const client = getClient();
      if (client) this.flush(userId, client);
    };

    const onOnline = () => {
      const client = getClient();
      if (!client) return;
      this.retryCount = 0;
      if (this.retryTimer) {
        clearTimeout(this.retryTimer);
        this.retryTimer = null;
      }
      this.flush(userId, client);
    };

    const onOffline = () => {
      this.callbacks.onStatusChange('offline');
    };

    if (typeof window !== 'undefined') {
      document.addEventListener('visibilitychange', onVisibilityChange);
      window.addEventListener('pagehide', onPageHide);
      window.addEventListener('beforeunload', onBeforeUnload);
      window.addEventListener('online', onOnline);
      window.addEventListener('offline', onOffline);
    }

    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        const client = getClient();
        if (client) this.pullCheck(userId, client);
      }
    }, 60000);

    return () => {
      if (typeof window !== 'undefined') {
        document.removeEventListener('visibilitychange', onVisibilityChange);
        window.removeEventListener('pagehide', onPageHide);
        window.removeEventListener('beforeunload', onBeforeUnload);
        window.removeEventListener('online', onOnline);
        window.removeEventListener('offline', onOffline);
      }
      clearInterval(interval);
      if (this.debounceTimer) clearTimeout(this.debounceTimer);
      if (this.retryTimer) clearTimeout(this.retryTimer);
    };
  }
}

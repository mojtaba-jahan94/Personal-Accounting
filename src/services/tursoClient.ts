import { createClient, Client } from '@libsql/client/web';

const TURSO_CONFIG_KEY = 'pf_turso_config_v1';

export interface TursoConfig {
  url: string;
  authToken: string;
}

/**
 * Retrieve current Turso configuration from env or localStorage
 */
export function getTursoConfig(): TursoConfig {
  // Check localStorage first (user-configured in UI)
  try {
    const saved = localStorage.getItem(TURSO_CONFIG_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.url) {
        return {
          url: parsed.url.trim(),
          authToken: (parsed.authToken || '').trim(),
        };
      }
    }
  } catch (e) {
    console.error('Error reading turso config from storage:', e);
  }

  // Fallback to environment variables
  const envUrl = ((import.meta as any).env?.VITE_TURSO_DATABASE_URL as string) || '';
  const envToken = ((import.meta as any).env?.VITE_TURSO_AUTH_TOKEN as string) || '';

  return {
    url: envUrl.trim(),
    authToken: envToken.trim(),
  };
}

/**
 * Persist Turso configuration to localStorage
 */
export function saveTursoConfig(url: string, authToken: string): void {
  localStorage.setItem(
    TURSO_CONFIG_KEY,
    JSON.stringify({
      url: url.trim(),
      authToken: authToken.trim(),
    })
  );
  // Reset cached client
  cachedClient = null;
}

/**
 * Clear Turso configuration
 */
export function clearTursoConfig(): void {
  localStorage.removeItem(TURSO_CONFIG_KEY);
  cachedClient = null;
}

let cachedClient: Client | null = null;
let currentClientUrl = '';
let currentClientToken = '';

/**
 * Normalize Turso URL so it works seamlessly with HTTP fetch in browser
 * Libsql URLs like libsql://my-db.turso.io need to be https://my-db.turso.io for web client
 */
export function normalizeTursoUrl(rawUrl: string): string {
  let url = rawUrl.trim();
  if (url.startsWith('libsql://')) {
    url = url.replace('libsql://', 'https://');
  }
  return url;
}

/**
 * Get or initialize the active Turso LibSQL client
 */
export function getTursoClient(customConfig?: TursoConfig): Client | null {
  const config = customConfig || getTursoConfig();
  if (!config.url) {
    return null;
  }

  const normalizedUrl = normalizeTursoUrl(config.url);

  if (
    cachedClient &&
    currentClientUrl === normalizedUrl &&
    currentClientToken === config.authToken
  ) {
    return cachedClient;
  }

  try {
    cachedClient = createClient({
      url: normalizedUrl,
      authToken: config.authToken || undefined,
    });
    currentClientUrl = normalizedUrl;
    currentClientToken = config.authToken;
    return cachedClient;
  } catch (error) {
    console.error('Failed to initialize Turso client:', error);
    return null;
  }
}

/**
 * Test a Turso connection by executing a simple SELECT 1 query
 */
export async function testTursoConnection(
  url: string,
  authToken: string
): Promise<{ success: boolean; message?: string }> {
  try {
    if (!url) {
      return { success: false, message: 'آدرس پایگاه داده Turso وارد نشده است.' };
    }

    const normalizedUrl = normalizeTursoUrl(url);
    const testClient = createClient({
      url: normalizedUrl,
      authToken: authToken.trim() || undefined,
    });

    const result = await testClient.execute('SELECT 1 as connected');
    if (result && result.rows) {
      return { success: true };
    }
    return { success: false, message: 'پاسخی از سرور دریافت نشد.' };
  } catch (error: any) {
    console.error('Turso connection test failed:', error);
    return {
      success: false,
      message: error?.message || 'خطا در برقراری ارتباط با پایگاه داده Turso.',
    };
  }
}

let isSchemaInitialized = false;

/**
 * Automatically create tables in Turso if they do not exist yet
 */
export async function initTursoSchema(client: Client): Promise<void> {
  if (isSchemaInitialized) return;

  try {
    // 1. Users table for authentication
    await client.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        salt TEXT NOT NULL,
        display_name TEXT,
        created_at TEXT NOT NULL,
        last_login TEXT NOT NULL
      )
    `);

    // 2. User Finance Collections table (all data scoped per user)
    await client.execute(`
      CREATE TABLE IF NOT EXISTS user_finance_data (
        user_id TEXT NOT NULL,
        collection_key TEXT NOT NULL,
        data_json TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        PRIMARY KEY (user_id, collection_key)
      )
    `);

    isSchemaInitialized = true;
  } catch (error) {
    console.error('Error creating Turso tables:', error);
    throw error;
  }
}

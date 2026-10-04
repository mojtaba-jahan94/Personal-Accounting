import { createClient, Client } from '@libsql/client/web';

const TURSO_CONFIG_KEY = 'pf_turso_config_v1';

export interface TursoConfig {
  url: string;
  authToken: string;
}

/**
 * Clean auth token of any stray quotes, spaces, or linebreaks
 */
export function cleanAuthToken(rawToken: string): string {
  if (!rawToken) return '';
  return rawToken.trim().replace(/^['"`]+|['"`]+$/g, '').trim();
}

/**
 * Normalize Turso URL so it works seamlessly with HTTP fetch in browser.
 * Handles libsql:// prefixes, missing https:// prefixes, quotes, and trailing slashes.
 */
export function normalizeTursoUrl(rawUrl: string): string {
  if (!rawUrl) return '';
  let url = rawUrl.trim().replace(/^['"`]+|['"`]+$/g, '').trim();
  url = url.replace(/\/+$/, '');
  
  if (url.startsWith('libsql://')) {
    url = url.replace('libsql://', 'https://');
  } else if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`;
  }
  return url;
}

/**
 * Translate error objects/codes from Turso or fetch into clear Persian guidance
 */
export function formatTursoErrorMessage(error: any): string {
  if (!error) return 'خطای نامشخص در برقراری ارتباط با سرور.';
  const msg = (error.message || String(error)).toLowerCase();
  
  if (msg.includes('401') || msg.includes('unauthorized')) {
    return 'توکن دسترسی (Auth Token) نامعتبر یا منقضی شده است. لطفاً توکن جدیدی ایجاد کنید.';
  }
  if (msg.includes('404') || msg.includes('not found')) {
    return 'پایگاه داده یافت نشد (خطای ۴۰۴). لطفاً نام دیتابیس یا آدرس URL را بررسی نمایید.';
  }
  if (msg.includes('url_invalid') || msg.includes('invalid url')) {
    return 'فرمت آدرس پایگاه داده نامعتبر است. آدرس باید به صورت libsql://... یا https://... باشد.';
  }
  if (
    msg.includes('fetch failed') ||
    msg.includes('failed to fetch') ||
    msg.includes('network') ||
    msg.includes('timeout') ||
    msg.includes('connection refused') ||
    msg.includes('مهلت زمانی')
  ) {
    return 'سرور Turso پاسخ نمی‌دهد (خطای شبکه/تایم‌اوت). به دلیل محدودیت‌های اینترنت و فیلترینگ، لطفاً اتصال اینترنت یا فیلترشکن خود را بررسی و فعال نمایید.';
  }
  
  return error.message || 'خطا در برقراری ارتباط با پایگاه داده Turso.';
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
          url: normalizeTursoUrl(parsed.url),
          authToken: cleanAuthToken(parsed.authToken || ''),
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
    url: normalizeTursoUrl(envUrl),
    authToken: cleanAuthToken(envToken),
  };
}

/**
 * Persist Turso configuration to localStorage
 */
export function saveTursoConfig(url: string, authToken: string): void {
  const cleanUrl = normalizeTursoUrl(url);
  const cleanToken = cleanAuthToken(authToken);

  localStorage.setItem(
    TURSO_CONFIG_KEY,
    JSON.stringify({
      url: cleanUrl,
      authToken: cleanToken,
    })
  );
  // Reset cached client
  cachedClient = null;
  currentClientUrl = '';
  currentClientToken = '';
}

/**
 * Clear Turso configuration
 */
export function clearTursoConfig(): void {
  localStorage.removeItem(TURSO_CONFIG_KEY);
  cachedClient = null;
  currentClientUrl = '';
  currentClientToken = '';
}

let cachedClient: Client | null = null;
let currentClientUrl = '';
let currentClientToken = '';

/**
 * Get or initialize the active Turso LibSQL client
 */
export function getTursoClient(customConfig?: TursoConfig): Client | null {
  const config = customConfig || getTursoConfig();
  if (!config.url) {
    return null;
  }

  const normalizedUrl = normalizeTursoUrl(config.url);
  const token = cleanAuthToken(config.authToken);

  if (
    cachedClient &&
    currentClientUrl === normalizedUrl &&
    currentClientToken === token
  ) {
    return cachedClient;
  }

  try {
    cachedClient = createClient({
      url: normalizedUrl,
      authToken: token || undefined,
    });
    currentClientUrl = normalizedUrl;
    currentClientToken = token;
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
    if (!url || !url.trim()) {
      return { success: false, message: 'آدرس پایگاه داده Turso وارد نشده است.' };
    }

    const normalizedUrl = normalizeTursoUrl(url);
    const cleanedToken = cleanAuthToken(authToken);

    const testClient = createClient({
      url: normalizedUrl,
      authToken: cleanedToken || undefined,
    });

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(
        () =>
          reject(
            new Error(
              'مهلت زمانی اتصال به پایان رسید (Timeout). سرور Turso در دسترس نیست؛ لطفاً وضعیت فیلترشکن را بررسی کنید.'
            )
          ),
        10000
      );
    });

    const result = await Promise.race([
      testClient.execute('SELECT 1 as connected'),
      timeoutPromise,
    ]);

    if (result && (result as any).rows) {
      return { success: true };
    }
    return { success: false, message: 'پاسخی از سرور دریافت نشد.' };
  } catch (error: any) {
    console.error('Turso connection test failed:', error);
    return {
      success: false,
      message: formatTursoErrorMessage(error),
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

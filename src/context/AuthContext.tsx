import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  getTursoClient,
  getTursoConfig,
  initTursoSchema,
  saveTursoConfig,
  clearTursoConfig,
  testTursoConnection,
  TursoConfig,
} from '../services/tursoClient';
import {
  generateSalt,
  hashPassword,
  verifyPassword,
  generateSessionToken,
} from '../services/cryptoAuth';

export interface AuthUser {
  id: string;
  username: string;
  displayName: string;
  createdAt: string;
  lastLogin: string;
}

interface AuthContextType {
  user: AuthUser | null;
  sessionToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  tursoStatus: 'connected' | 'connecting' | 'error' | 'unconfigured';
  tursoError: string | null;
  isTursoConfigured: boolean;
  login: (username: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string }>;
  register: (username: string, password: string, displayName?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (displayName: string, currentPassword?: string, newPassword?: string) => Promise<{ success: boolean; error?: string }>;
  configureTurso: (url: string, token: string) => Promise<{ success: boolean; error?: string }>;
  refreshTursoConnection: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEYS = {
  SESSION_TOKEN: 'pf_auth_token_v1',
  USER_DATA: 'pf_auth_user_v1',
  REMEMBER_ME: 'pf_auth_remember_v1',
  FAILED_ATTEMPTS: 'pf_auth_failed_attempts_v1',
  LOCKOUT_TIME: 'pf_auth_lockout_time_v1',
};

// Local storage fallback for offline/demo users when Turso is not yet connected
const LOCAL_USERS_KEY = 'pf_local_users_v1';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [tursoStatus, setTursoStatus] = useState<'connected' | 'connecting' | 'error' | 'unconfigured'>('connecting');
  const [tursoError, setTursoError] = useState<string | null>(null);

  const tursoConfig = getTursoConfig();
  const isTursoConfigured = Boolean(tursoConfig.url);

  // Initialize Turso & check connection
  const checkConnection = useCallback(async () => {
    const config = getTursoConfig();
    if (!config.url) {
      setTursoStatus('unconfigured');
      setTursoError(null);
      return;
    }

    setTursoStatus('connecting');
    setTursoError(null);

    const test = await testTursoConnection(config.url, config.authToken);
    if (!test.success) {
      setTursoStatus('error');
      setTursoError(test.message || 'خطا در اتصال به سرور Turso');
      return;
    }

    try {
      const client = getTursoClient();
      if (client) {
        await initTursoSchema(client);
        setTursoStatus('connected');
        setTursoError(null);
      } else {
        setTursoStatus('error');
        setTursoError('امکان ایجاد ارتباط با سرور Turso وجود ندارد.');
      }
    } catch (e: any) {
      setTursoStatus('error');
      setTursoError(e?.message || 'خطا در ساخت ساختار جداول سرور Turso');
    }
  }, []);

  // Restore session on mount
  useEffect(() => {
    const restoreSession = async () => {
      setIsLoading(true);
      await checkConnection();

      try {
        const isRemember = localStorage.getItem(AUTH_STORAGE_KEYS.REMEMBER_ME) === 'true';
        const storage = isRemember ? localStorage : sessionStorage;
        const storedToken = storage.getItem(AUTH_STORAGE_KEYS.SESSION_TOKEN);
        const storedUser = storage.getItem(AUTH_STORAGE_KEYS.USER_DATA);

        if (storedToken && storedUser) {
          const parsedUser: AuthUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setSessionToken(storedToken);
        }
      } catch (e) {
        console.error('Failed to restore session:', e);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, [checkConnection]);

  // Rate-limiting check to prevent brute-force attacks
  const checkLockout = (): { isLocked: boolean; remainingSeconds?: number } => {
    const lockoutUntil = parseInt(localStorage.getItem(AUTH_STORAGE_KEYS.LOCKOUT_TIME) || '0', 10);
    const now = Date.now();
    if (lockoutUntil > now) {
      const remainingSeconds = Math.ceil((lockoutUntil - now) / 1000);
      return { isLocked: true, remainingSeconds };
    }
    return { isLocked: false };
  };

  const registerFailedAttempt = () => {
    const current = parseInt(localStorage.getItem(AUTH_STORAGE_KEYS.FAILED_ATTEMPTS) || '0', 10) + 1;
    localStorage.setItem(AUTH_STORAGE_KEYS.FAILED_ATTEMPTS, current.toString());
    if (current >= 5) {
      // Lock for 30 seconds
      localStorage.setItem(AUTH_STORAGE_KEYS.LOCKOUT_TIME, (Date.now() + 30000).toString());
    }
  };

  const resetFailedAttempts = () => {
    localStorage.removeItem(AUTH_STORAGE_KEYS.FAILED_ATTEMPTS);
    localStorage.removeItem(AUTH_STORAGE_KEYS.LOCKOUT_TIME);
  };

  // Login handler
  const login = async (
    rawUsername: string,
    rawPassword: string,
    rememberMe = true
  ): Promise<{ success: boolean; error?: string }> => {
    const lockout = checkLockout();
    if (lockout.isLocked) {
      return {
        success: false,
        error: `به دلیل تلاش‌های ناموفق مکرر، لطفاً ${lockout.remainingSeconds} ثانیه صبر کرده و سپس مجدداً تلاش نمایید.`,
      };
    }

    const username = rawUsername.trim().toLowerCase();
    const password = rawPassword;

    if (!username || !password) {
      return { success: false, error: 'لطفاً نام کاربری و کلمه عبور را وارد کنید.' };
    }

    const client = getTursoClient();

    try {
      if (client && tursoStatus === 'connected') {
        // Query user from Turso
        const result = await client.execute({
          sql: 'SELECT id, username, password_hash, salt, display_name, created_at, last_login FROM users WHERE username = ?',
          args: [username],
        });

        if (result.rows.length === 0) {
          registerFailedAttempt();
          return { success: false, error: 'نام کاربری یا کلمه عبور نادرست است.' };
        }

        const row = result.rows[0];
        const storedHash = row.password_hash as string;
        const salt = row.salt as string;

        const isMatch = await verifyPassword(password, salt, storedHash);
        if (!isMatch) {
          registerFailedAttempt();
          return { success: false, error: 'نام کاربری یا کلمه عبور نادرست است.' };
        }

        resetFailedAttempts();

        const nowIso = new Date().toISOString();
        const updatedUser: AuthUser = {
          id: row.id as string,
          username: row.username as string,
          displayName: (row.display_name as string) || (row.username as string),
          createdAt: row.created_at as string,
          lastLogin: nowIso,
        };

        // Update last_login in Turso
        try {
          await client.execute({
            sql: 'UPDATE users SET last_login = ? WHERE id = ?',
            args: [nowIso, updatedUser.id],
          });
        } catch (e) {
          console.warn('Failed to update last_login in Turso', e);
        }

        const token = generateSessionToken();
        const storage = rememberMe ? localStorage : sessionStorage;
        localStorage.setItem(AUTH_STORAGE_KEYS.REMEMBER_ME, rememberMe ? 'true' : 'false');
        storage.setItem(AUTH_STORAGE_KEYS.SESSION_TOKEN, token);
        storage.setItem(AUTH_STORAGE_KEYS.USER_DATA, JSON.stringify(updatedUser));

        setUser(updatedUser);
        setSessionToken(token);
        return { success: true };
      } else {
        // Offline / Local fallback if Turso not configured yet
        const savedUsersRaw = localStorage.getItem(LOCAL_USERS_KEY);
        const usersList: any[] = savedUsersRaw ? JSON.parse(savedUsersRaw) : [];
        const localUser = usersList.find(u => u.username === username);

        if (!localUser) {
          registerFailedAttempt();
          return { success: false, error: 'نام کاربری یا کلمه عبور نادرست است.' };
        }

        const isMatch = await verifyPassword(password, localUser.salt, localUser.password_hash);
        if (!isMatch) {
          registerFailedAttempt();
          return { success: false, error: 'نام کاربری یا کلمه عبور نادرست است.' };
        }

        resetFailedAttempts();

        const updatedUser: AuthUser = {
          id: localUser.id,
          username: localUser.username,
          displayName: localUser.display_name || localUser.username,
          createdAt: localUser.created_at,
          lastLogin: new Date().toISOString(),
        };

        const token = generateSessionToken();
        const storage = rememberMe ? localStorage : sessionStorage;
        localStorage.setItem(AUTH_STORAGE_KEYS.REMEMBER_ME, rememberMe ? 'true' : 'false');
        storage.setItem(AUTH_STORAGE_KEYS.SESSION_TOKEN, token);
        storage.setItem(AUTH_STORAGE_KEYS.USER_DATA, JSON.stringify(updatedUser));

        setUser(updatedUser);
        setSessionToken(token);
        return { success: true };
      }
    } catch (e: any) {
      console.error('Login error:', e);
      return { success: false, error: e?.message || 'خطا در فرآیند ورود به سیستم.' };
    }
  };

  // Register handler
  const register = async (
    rawUsername: string,
    rawPassword: string,
    rawDisplayName?: string
  ): Promise<{ success: boolean; error?: string }> => {
    const username = rawUsername.trim().toLowerCase();
    const password = rawPassword;
    const displayName = (rawDisplayName || '').trim() || username;

    if (username.length < 3) {
      return { success: false, error: 'نام کاربری باید حداقل ۳ کاراکتر باشد.' };
    }

    if (!/^[a-zA-Z0-9_.-]+$/.test(username)) {
      return { success: false, error: 'نام کاربری فقط می‌تواند شامل حروف انگلیسی، اعداد و خط تیره یا زیرخط باشد.' };
    }

    if (password.length < 6) {
      return { success: false, error: 'کلمه عبور باید حداقل ۶ کاراکتر باشد.' };
    }

    const client = getTursoClient();

    try {
      const salt = generateSalt(16);
      const passwordHash = await hashPassword(password, salt);
      const userId = 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
      const nowIso = new Date().toISOString();

      if (client && tursoStatus === 'connected') {
        // Check if username already exists in Turso
        const existing = await client.execute({
          sql: 'SELECT id FROM users WHERE username = ?',
          args: [username],
        });

        if (existing.rows.length > 0) {
          return { success: false, error: 'این نام کاربری قبلاً ثبت شده است. لطفاً نام دیگری انتخاب نمایید.' };
        }

        // Insert new user into Turso
        await client.execute({
          sql: `
            INSERT INTO users (id, username, password_hash, salt, display_name, created_at, last_login)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `,
          args: [userId, username, passwordHash, salt, displayName, nowIso, nowIso],
        });

        const newUser: AuthUser = {
          id: userId,
          username,
          displayName,
          createdAt: nowIso,
          lastLogin: nowIso,
        };

        const token = generateSessionToken();
        localStorage.setItem(AUTH_STORAGE_KEYS.REMEMBER_ME, 'true');
        localStorage.setItem(AUTH_STORAGE_KEYS.SESSION_TOKEN, token);
        localStorage.setItem(AUTH_STORAGE_KEYS.USER_DATA, JSON.stringify(newUser));

        setUser(newUser);
        setSessionToken(token);
        return { success: true };
      } else {
        // Offline / Local storage fallback
        const savedUsersRaw = localStorage.getItem(LOCAL_USERS_KEY);
        const usersList: any[] = savedUsersRaw ? JSON.parse(savedUsersRaw) : [];

        if (usersList.some(u => u.username === username)) {
          return { success: false, error: 'این نام کاربری قبلاً ثبت شده است.' };
        }

        const newUserRecord = {
          id: userId,
          username,
          password_hash: passwordHash,
          salt,
          display_name: displayName,
          created_at: nowIso,
          last_login: nowIso,
        };

        usersList.push(newUserRecord);
        localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(usersList));

        const newUser: AuthUser = {
          id: userId,
          username,
          displayName,
          createdAt: nowIso,
          lastLogin: nowIso,
        };

        const token = generateSessionToken();
        localStorage.setItem(AUTH_STORAGE_KEYS.REMEMBER_ME, 'true');
        localStorage.setItem(AUTH_STORAGE_KEYS.SESSION_TOKEN, token);
        localStorage.setItem(AUTH_STORAGE_KEYS.USER_DATA, JSON.stringify(newUser));

        setUser(newUser);
        setSessionToken(token);
        return { success: true };
      }
    } catch (e: any) {
      console.error('Registration error:', e);
      return { success: false, error: e?.message || 'خطا در ثبت کاربر جدید.' };
    }
  };

  // Logout handler
  const logout = async (): Promise<void> => {
    localStorage.removeItem(AUTH_STORAGE_KEYS.SESSION_TOKEN);
    localStorage.removeItem(AUTH_STORAGE_KEYS.USER_DATA);
    sessionStorage.removeItem(AUTH_STORAGE_KEYS.SESSION_TOKEN);
    sessionStorage.removeItem(AUTH_STORAGE_KEYS.USER_DATA);
    setUser(null);
    setSessionToken(null);
  };

  // Update profile
  const updateProfile = async (
    displayName: string,
    currentPassword?: string,
    newPassword?: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: 'کاربر احراز هویت نشده است.' };

    const client = getTursoClient();
    const updatedName = displayName.trim() || user.username;

    try {
      if (newPassword) {
        if (!currentPassword) {
          return { success: false, error: 'برای تغییر رمز عبور، وارد کردن رمز فعلی الزامی است.' };
        }
        if (newPassword.length < 6) {
          return { success: false, error: 'رمز عبور جدید باید حداقل ۶ کاراکتر باشد.' };
        }

        if (client && tursoStatus === 'connected') {
          const res = await client.execute({
            sql: 'SELECT password_hash, salt FROM users WHERE id = ?',
            args: [user.id],
          });
          if (res.rows.length === 0) {
            return { success: false, error: 'اطلاعات کاربر یافت نشد.' };
          }
          const isCorrect = await verifyPassword(
            currentPassword,
            res.rows[0].salt as string,
            res.rows[0].password_hash as string
          );
          if (!isCorrect) {
            return { success: false, error: 'رمز عبور فعلی نادرست است.' };
          }

          const newSalt = generateSalt(16);
          const newHash = await hashPassword(newPassword, newSalt);

          await client.execute({
            sql: 'UPDATE users SET display_name = ?, password_hash = ?, salt = ? WHERE id = ?',
            args: [updatedName, newHash, newSalt, user.id],
          });
        }
      } else {
        if (client && tursoStatus === 'connected') {
          await client.execute({
            sql: 'UPDATE users SET display_name = ? WHERE id = ?',
            args: [updatedName, user.id],
          });
        }
      }

      const updatedUser: AuthUser = {
        ...user,
        displayName: updatedName,
      };

      const isRemember = localStorage.getItem(AUTH_STORAGE_KEYS.REMEMBER_ME) === 'true';
      const storage = isRemember ? localStorage : sessionStorage;
      storage.setItem(AUTH_STORAGE_KEYS.USER_DATA, JSON.stringify(updatedUser));
      setUser(updatedUser);

      return { success: true };
    } catch (e: any) {
      console.error('Update profile error:', e);
      return { success: false, error: e?.message || 'خطا در بروزرسانی اطلاعات کاربری.' };
    }
  };

  // Configure Turso database credentials
  const configureTurso = async (
    url: string,
    token: string
  ): Promise<{ success: boolean; error?: string }> => {
    const test = await testTursoConnection(url, token);
    if (!test.success) {
      return { success: false, error: test.message || 'اتصال برقرار نشد. لطفاً آدرس و توکن را بررسی کنید.' };
    }

    saveTursoConfig(url, token);
    await checkConnection();
    return { success: true };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        sessionToken,
        isAuthenticated: Boolean(user && sessionToken),
        isLoading,
        tursoStatus,
        tursoError,
        isTursoConfigured,
        login,
        register,
        logout,
        updateProfile,
        configureTurso,
        refreshTursoConnection: checkConnection,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

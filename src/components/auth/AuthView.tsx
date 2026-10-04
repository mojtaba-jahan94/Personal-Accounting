import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  User,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  UserPlus,
  Database,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { TursoConfigModal } from '../settings/TursoConfigModal';

interface AuthViewProps {
  onSuccess?: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onSuccess }) => {
  const { login, register, tursoStatus, isTursoConfigured } = useAuth();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [isTursoModalOpen, setIsTursoModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    const res = await login(username, password, rememberMe);
    setIsSubmitting(false);

    if (res.success) {
      if (onSuccess) onSuccess();
    } else {
      setErrorMsg(res.error || 'خطا در ورود به حساب کاربری.');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (password !== confirmPassword) {
      setErrorMsg('تکرار کلمه عبور با کلمه عبور مطابقت ندارد.');
      return;
    }

    setIsSubmitting(true);
    const res = await register(username, password, displayName);
    setIsSubmitting(false);

    if (res.success) {
      if (onSuccess) onSuccess();
    } else {
      setErrorMsg(res.error || 'خطا در ثبت‌نام کاربر.');
    }
  };

  // Quick Demo / Offline account option
  const handleQuickDemo = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);
    // Try to login with demo user, or register if doesn't exist
    const loginRes = await login('demo', '123456', true);
    if (!loginRes.success) {
      const regRes = await register('demo', '123456', 'کاربر آزمایشی');
      if (!regRes.success) {
        setErrorMsg(regRes.error || 'خطا در ایجاد کاربر آزمایشی');
      }
    }
    setIsSubmitting(false);
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-slate-100 via-indigo-50/30 to-slate-200 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/20 text-slate-900 dark:text-white"
    >
      <div className="w-full max-w-md">
        {/* Brand / Logo header */}
        <div className="text-center mb-6 space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-3xl bg-indigo-600 text-white shadow-xl shadow-indigo-600/30 mb-2">
            <Sparkles className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            حسابداری شخصی
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            مدیریت دخل و خرج، بودجه‌بندی و دارایی‌ها
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          {/* Tab selector */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setActiveTab('login');
                setErrorMsg(null);
              }}
              className={`py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 ${
                activeTab === 'login'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>ورود به حساب</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('register');
                setErrorMsg(null);
              }}
              className={`py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 ${
                activeTab === 'register'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>ثبت‌نام جدید</span>
            </button>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-start gap-2.5 text-xs font-bold text-rose-600 dark:text-rose-400 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{errorMsg}</span>
            </div>
          )}

          {/* Login Form */}
          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  نام کاربری
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="مثال: ali_reza"
                    dir="ltr"
                    className="w-full pl-3.5 pr-10 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-slate-900 dark:text-white outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-800 transition"
                  />
                  <div className="absolute right-3.5 top-3.5 text-slate-400 pointer-events-none">
                    <User className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  کلمه عبور
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="کلمه عبور خود را وارد نمایید"
                    dir="ltr"
                    className="w-full pl-10 pr-10 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-slate-900 dark:text-white outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-800 transition"
                  />
                  <div className="absolute right-3.5 top-3.5 text-slate-400 pointer-events-none">
                    <Lock className="w-4 h-4" />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3.5 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="font-bold text-slate-600 dark:text-slate-400">
                    مرا به خاطر بسپار
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] text-white font-black text-xs sm:text-sm shadow-lg shadow-indigo-600/25 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>ورود به سامانه</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Register Form */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  نام کاربری (انگلیسی)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="مثال: mohammad_94"
                    dir="ltr"
                    className="w-full pl-3.5 pr-10 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-slate-900 dark:text-white outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-800 transition"
                  />
                  <div className="absolute right-3.5 top-3.5 text-slate-400 pointer-events-none">
                    <User className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  نام و نام خانوادگی (اختیاری)
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="مثال: محمد احمدی"
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-800 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  کلمه عبور (حداقل ۶ کاراکتر)
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="حداقل ۶ کاراکتر"
                    dir="ltr"
                    className="w-full pl-10 pr-10 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-slate-900 dark:text-white outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-800 transition"
                  />
                  <div className="absolute right-3.5 top-3.5 text-slate-400 pointer-events-none">
                    <Lock className="w-4 h-4" />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3.5 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  تکرار کلمه عبور
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="تکرار کلمه عبور"
                  dir="ltr"
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-slate-900 dark:text-white outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-800 transition"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] text-white font-black text-xs sm:text-sm shadow-lg shadow-indigo-600/25 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>ایجاد حساب کاربری</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Quick Demo Option for local preview */}
          <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={handleQuickDemo}
              disabled={isSubmitting}
              className="text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold transition flex items-center gap-1"
            >
              <span>ورود سریع با کاربر آزمایشی</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {/* Turso Connection Settings Button */}
            <button
              type="button"
              onClick={() => setIsTursoModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 font-bold transition"
            >
              <Database className="w-3.5 h-3.5 text-indigo-500" />
              <span>تنظیمات پایگاه داده Turso</span>
              {tursoStatus === 'connected' && (
                <span className="w-2 h-2 rounded-full bg-emerald-500" title="متصل" />
              )}
            </button>
          </div>
        </div>

        {/* Database Status footer badge */}
        <div className="text-center mt-4">
          {tursoStatus === 'connected' ? (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              اطلاعات روی پایگاه داده سرور Turso ذخیره می‌شود
            </span>
          ) : isTursoConfigured ? (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-600 dark:text-amber-400">
              در حال برقراری ارتباط با سرور Turso...
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-400 dark:text-slate-500">
              برای ذخیره اطلاعات روی سرور ابری، دیتابیس Turso را متصل نمایید.
            </span>
          )}
        </div>
      </div>

      <TursoConfigModal
        isOpen={isTursoModalOpen}
        onClose={() => setIsTursoModalOpen(false)}
      />
    </div>
  );
};

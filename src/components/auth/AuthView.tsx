import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  User,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  UserPlus,
  ArrowRight,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

interface AuthViewProps {
  onSuccess?: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onSuccess }) => {
  const { login, register } = useAuth();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
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
      className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-[#F7F7F2] dark:bg-[#1F2933] text-[#1F2933] dark:text-[#F7F7F2] relative overflow-hidden"
    >
      {/* Soft Ambient Radiance */}
      <div className="absolute top-1/4 -right-20 w-80 h-80 bg-[#A68A64]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -left-20 w-80 h-80 bg-[#2E7D5B]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand / Logo header */}
        <div className="text-center mb-6 space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-3xl bg-[#A68A64] text-[#F7F7F2] shadow-xl shadow-[#A68A64]/20 mb-2">
            <Sparkles className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-[#1F2933] dark:text-[#F7F7F2]">
            حسابداری شخصی
          </h1>
          <p className="text-xs text-[#6B7280] dark:text-[#D1D5DB]/70 font-medium">
            مدیریت دخل و خرج، بودجه‌بندی و پایش هوشمند دارایی‌ها
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#F7F7F2]/90 dark:bg-[#141B22]/80 backdrop-blur-xl border border-[#6B7280]/20 dark:border-[#D1D5DB]/15 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          {/* Tab selector */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#6B7280]/15 dark:bg-[#D1D5DB]/15 rounded-2xl text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setActiveTab('login');
                setErrorMsg(null);
              }}
              className={`py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 ${
                activeTab === 'login'
                  ? 'bg-[#A68A64] text-[#F7F7F2] shadow-xs'
                  : 'text-[#6B7280] dark:text-[#D1D5DB] hover:text-[#1F2933] dark:hover:text-[#F7F7F2]'
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
                  ? 'bg-[#A68A64] text-[#F7F7F2] shadow-xs'
                  : 'text-[#6B7280] dark:text-[#D1D5DB] hover:text-[#1F2933] dark:hover:text-[#F7F7F2]'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>ثبت‌نام جدید</span>
            </button>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-[#C0564B]/15 border border-[#C0564B]/30 flex items-start gap-2.5 text-xs font-bold text-[#C0564B] dark:text-[#F87171] animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{errorMsg}</span>
            </div>
          )}

          {/* Login Form */}
          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#1F2933] dark:text-[#D1D5DB] mb-1.5">
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
                    className="w-full pl-3.5 pr-10 py-3 rounded-2xl bg-white dark:bg-[#1F2933] border border-[#6B7280]/20 dark:border-[#D1D5DB]/15 text-xs font-mono font-bold text-[#1F2933] dark:text-[#F7F7F2] outline-none focus:border-[#A68A64] focus:ring-1 focus:ring-[#A68A64] transition"
                  />
                  <div className="absolute right-3.5 top-3.5 text-[#6B7280] pointer-events-none">
                    <User className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1F2933] dark:text-[#D1D5DB] mb-1.5">
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
                    className="w-full pl-10 pr-10 py-3 rounded-2xl bg-white dark:bg-[#1F2933] border border-[#6B7280]/20 dark:border-[#D1D5DB]/15 text-xs font-mono font-bold text-[#1F2933] dark:text-[#F7F7F2] outline-none focus:border-[#A68A64] focus:ring-1 focus:ring-[#A68A64] transition"
                  />
                  <div className="absolute right-3.5 top-3.5 text-[#6B7280] pointer-events-none">
                    <Lock className="w-4 h-4" />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3.5 top-3.5 text-[#6B7280] hover:text-[#1F2933] dark:hover:text-[#F7F7F2] transition"
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
                    className="w-4 h-4 rounded text-[#A68A64] focus:ring-[#A68A64] accent-[#A68A64]"
                  />
                  <span className="font-bold text-[#6B7280] dark:text-[#D1D5DB]/70">
                    مرا به خاطر بسپار
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-2xl bg-[#A68A64] hover:bg-[#8A704C] active:scale-[0.99] text-[#F7F7F2] font-black text-xs sm:text-sm shadow-lg shadow-[#A68A64]/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 rounded-full border-2 border-[#F7F7F2] border-t-transparent animate-spin" />
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
                <label className="block text-xs font-bold text-[#1F2933] dark:text-[#D1D5DB] mb-1.5">
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
                    className="w-full pl-3.5 pr-10 py-3 rounded-2xl bg-white dark:bg-[#1F2933] border border-[#6B7280]/20 dark:border-[#D1D5DB]/15 text-xs font-mono font-bold text-[#1F2933] dark:text-[#F7F7F2] outline-none focus:border-[#A68A64] focus:ring-1 focus:ring-[#A68A64] transition"
                  />
                  <div className="absolute right-3.5 top-3.5 text-[#6B7280] pointer-events-none">
                    <User className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1F2933] dark:text-[#D1D5DB] mb-1.5">
                  نام و نام خانوادگی (اختیاری)
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="مثال: محمد احمدی"
                  className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-[#1F2933] border border-[#6B7280]/20 dark:border-[#D1D5DB]/15 text-xs font-bold text-[#1F2933] dark:text-[#F7F7F2] outline-none focus:border-[#A68A64] focus:ring-1 focus:ring-[#A68A64] transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1F2933] dark:text-[#D1D5DB] mb-1.5">
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
                    className="w-full pl-10 pr-10 py-3 rounded-2xl bg-white dark:bg-[#1F2933] border border-[#6B7280]/20 dark:border-[#D1D5DB]/15 text-xs font-mono font-bold text-[#1F2933] dark:text-[#F7F7F2] outline-none focus:border-[#A68A64] focus:ring-1 focus:ring-[#A68A64] transition"
                  />
                  <div className="absolute right-3.5 top-3.5 text-[#6B7280] pointer-events-none">
                    <Lock className="w-4 h-4" />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3.5 top-3.5 text-[#6B7280] hover:text-[#1F2933] dark:hover:text-[#F7F7F2] transition"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1F2933] dark:text-[#D1D5DB] mb-1.5">
                  تکرار کلمه عبور
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="تکرار کلمه عبور"
                  dir="ltr"
                  className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-[#1F2933] border border-[#6B7280]/20 dark:border-[#D1D5DB]/15 text-xs font-mono font-bold text-[#1F2933] dark:text-[#F7F7F2] outline-none focus:border-[#A68A64] focus:ring-1 focus:ring-[#A68A64] transition"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-2xl bg-[#A68A64] hover:bg-[#8A704C] active:scale-[0.99] text-[#F7F7F2] font-black text-xs sm:text-sm shadow-lg shadow-[#A68A64]/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 rounded-full border-2 border-[#F7F7F2] border-t-transparent animate-spin" />
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>ایجاد حساب کاربری</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Quick Demo Option */}
          <div className="pt-3 border-t border-[#6B7280]/15 dark:border-[#D1D5DB]/10 flex items-center justify-center text-xs">
            <button
              type="button"
              onClick={handleQuickDemo}
              disabled={isSubmitting}
              className="text-[#A68A64] hover:underline font-bold transition flex items-center gap-1.5 py-1.5 px-3 rounded-xl hover:bg-[#A68A64]/10"
            >
              <span>ورود سریع با کاربر آزمایشی</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthView;

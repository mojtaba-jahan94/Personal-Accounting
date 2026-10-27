import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { BrandLogo } from '../common/BrandLogo';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
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
      className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-[#08070C] text-white relative overflow-hidden select-none"
    >
      {/* Cyber Grid Matrix */}
      <div className="absolute inset-0 cyber-grid-pattern opacity-30" />

      {/* Moving Cosmic Aurora Blobs */}
      <div className="absolute -top-32 right-[-10%] w-[500px] h-[500px] rounded-full bg-violet-600/25 blur-3xl pointer-events-none animate-aurora-1" />
      <div className="absolute -bottom-32 -left-[10%] w-[500px] h-[500px] rounded-full bg-indigo-600/20 blur-3xl pointer-events-none animate-aurora-2" />
      <div className="absolute top-[40%] right-[30%] w-[400px] h-[400px] rounded-full bg-emerald-500/15 blur-3xl pointer-events-none animate-aurora-3" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, type: 'spring', damping: 25 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Brand / Logo header */}
        <div className="text-center mb-6 space-y-2">
          <div className="inline-flex items-center justify-center mb-2 relative group">
            <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 opacity-50 blur-lg group-hover:opacity-80 transition duration-300" />
            <div className="relative">
              <BrandLogo size={68} animated={true} />
            </div>
          </div>
          <div className="flex items-center justify-center gap-2">
            <span className="text-[10px] tracking-[0.25em] font-mono font-bold bg-gradient-to-r from-violet-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent uppercase">
              AETHERIUM OS
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white drop-shadow-md">
            حسابداری شخصی پیشرفته
          </h1>
          <p className="text-xs text-zinc-400 font-medium max-w-xs mx-auto">
            مدیریت هوشمند دارایی‌ها، کنترل دخل‌وخرج و تحلیل جریان وجوه نقد
          </p>
        </div>

        {/* Auth Glass Card */}
        <Card variant="glass" className="p-6 sm:p-8 rounded-[2.5rem] border-white/10 shadow-2xl space-y-6 relative overflow-hidden backdrop-blur-2xl">
          {/* Top Specular Shimmer */}
          <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-400/40 via-violet-400/60 to-transparent pointer-events-none" />

          {/* Tab selector */}
          <div className="grid grid-cols-2 gap-1.5 p-1.5 bg-black/40 border border-white/10 rounded-2xl text-xs font-bold relative">
            <button
              type="button"
              onClick={() => {
                setActiveTab('login');
                setErrorMsg(null);
              }}
              className={`relative py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 ${
                activeTab === 'login' ? 'text-white' : 'text-fintech-text-muted hover:text-white'
              }`}
            >
              {activeTab === 'login' && (
                <motion.div
                  layoutId="authTabPill"
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 shadow-md shadow-violet-500/25 -z-10"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <LogIn className="w-3.5 h-3.5" />
              <span>ورود به حساب</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('register');
                setErrorMsg(null);
              }}
              className={`relative py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 ${
                activeTab === 'register' ? 'text-white' : 'text-fintech-text-muted hover:text-white'
              }`}
            >
              {activeTab === 'register' && (
                <motion.div
                  layoutId="authTabPill"
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 shadow-md shadow-violet-500/25 -z-10"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <UserPlus className="w-3.5 h-3.5" />
              <span>ثبت‌نام جدید</span>
            </button>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-start gap-2.5 text-xs font-bold text-rose-400">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{errorMsg}</span>
            </div>
          )}

          {/* Login Form */}
          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-fintech-text-primary mb-1.5">
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
                    className="w-full pl-3.5 pr-10 py-3 rounded-2xl bg-black/20 dark:bg-white/[0.04] border border-white/10 text-xs font-mono font-bold text-white outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/40 transition"
                  />
                  <div className="absolute right-3.5 top-3.5 text-fintech-text-muted pointer-events-none">
                    <User className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-fintech-text-primary mb-1.5">
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
                    className="w-full pl-10 pr-10 py-3 rounded-2xl bg-black/20 dark:bg-white/[0.04] border border-white/10 text-xs font-mono font-bold text-white outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/40 transition"
                  />
                  <div className="absolute right-3.5 top-3.5 text-fintech-text-muted pointer-events-none">
                    <Lock className="w-4 h-4" />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3.5 top-3.5 text-fintech-text-muted hover:text-white transition"
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
                    className="w-4 h-4 rounded border-white/20 bg-white/5 text-violet-500 focus:ring-violet-500 accent-violet-600"
                  />
                  <span className="font-bold text-fintech-text-muted">
                    مرا به خاطر بسپار
                  </span>
                </label>
              </div>

              <Button
                type="submit"
                variant="primary"
                fullWidth={true}
                isLoading={isSubmitting}
                icon={<LogIn className="w-4 h-4" />}
              >
                ورود به سامانه
              </Button>
            </form>
          )}

          {/* Register Form */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-fintech-text-primary mb-1.5">
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
                    className="w-full pl-3.5 pr-10 py-3 rounded-2xl bg-black/20 dark:bg-white/[0.04] border border-white/10 text-xs font-mono font-bold text-white outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/40 transition"
                  />
                  <div className="absolute right-3.5 top-3.5 text-fintech-text-muted pointer-events-none">
                    <User className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-fintech-text-primary mb-1.5">
                  نام و نام خانوادگی (اختیاری)
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="مثال: محمد احمدی"
                  className="w-full px-4 py-3 rounded-2xl bg-black/20 dark:bg-white/[0.04] border border-white/10 text-xs font-bold text-white outline-none focus:border-violet-500/60 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-fintech-text-primary mb-1.5">
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
                    className="w-full pl-10 pr-10 py-3 rounded-2xl bg-black/20 dark:bg-white/[0.04] border border-white/10 text-xs font-mono font-bold text-white outline-none focus:border-violet-500/60 transition"
                  />
                  <div className="absolute right-3.5 top-3.5 text-fintech-text-muted pointer-events-none">
                    <Lock className="w-4 h-4" />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3.5 top-3.5 text-fintech-text-muted hover:text-white transition"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-fintech-text-primary mb-1.5">
                  تکرار کلمه عبور
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="تکرار کلمه عبور"
                  dir="ltr"
                  className="w-full px-4 py-3 rounded-2xl bg-black/20 dark:bg-white/[0.04] border border-white/10 text-xs font-mono font-bold text-white outline-none focus:border-violet-500/60 transition"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                fullWidth={true}
                isLoading={isSubmitting}
                icon={<UserPlus className="w-4 h-4" />}
              >
                ایجاد حساب کاربری
              </Button>
            </form>
          )}

          {/* Quick Demo Option */}
          <div className="pt-3 border-t border-white/10 flex items-center justify-center text-xs">
            <button
              type="button"
              onClick={handleQuickDemo}
              disabled={isSubmitting}
              className="text-violet-400 hover:text-violet-300 font-bold transition flex items-center gap-1.5 py-1.5 px-3 rounded-xl hover:bg-violet-500/10"
            >
              <span>ورود سریع با حساب آزمایشی (Demo)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default AuthView;

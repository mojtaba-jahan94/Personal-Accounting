import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X, CheckCircle, Share } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already in standalone mode (already installed)
    const isStandalone =
      (typeof window !== 'undefined' &&
        window.matchMedia('(display-mode: standalone)').matches) ||
      (typeof window !== 'undefined' && (window.navigator as any).standalone === true);

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Check if user dismissed recently
      const dismissed = sessionStorage.getItem('pwa_prompt_dismissed');
      if (!dismissed) {
        setIsVisible(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setIsVisible(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      setShowGuide(true);
      return;
    }

    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      setIsVisible(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem('pwa_prompt_dismissed', 'true');
  };

  if (isInstalled) return null;

  return (
    <>
      {/* Floating Bottom Banner on Mobile / Tablet */}
      {isVisible && (
        <div className="fixed bottom-24 sm:bottom-6 right-4 left-4 sm:left-auto sm:right-6 sm:max-w-md z-40 animate-in slide-in-from-bottom duration-300 select-none">
          <div className="bg-[#F7F7F2]/95 dark:bg-[#1F2933]/90 backdrop-blur-xl p-4 rounded-3xl shadow-2xl border border-[#6B7280]/20 dark:border-[#D1D5DB]/15 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#A68A64] text-[#F7F7F2] flex items-center justify-center shrink-0 shadow-md shadow-[#A68A64]/25">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-[#1F2933] dark:text-[#F7F7F2]">
                  نصب برنامه حسابداری
                </h4>
                <p className="text-[11px] text-[#6B7280] dark:text-[#D1D5DB]/80">
                  دسترسی سریع و اجرای تمام‌صفحه و آفلاین
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={handleInstallClick}
                className="px-3.5 py-2 rounded-xl bg-[#A68A64] hover:bg-[#8A704C] text-[#F7F7F2] text-xs font-bold shadow-md shadow-[#A68A64]/25 transition flex items-center gap-1.5 active:scale-95"
              >
                <Download className="w-3.5 h-3.5" />
                <span>نصب</span>
              </button>
              <button
                onClick={handleDismiss}
                className="p-1.5 text-[#6B7280] hover:text-[#1F2933] dark:text-[#D1D5DB] dark:hover:text-white rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Guide Modal */}
      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
          <div className="bg-[#F7F7F2] dark:bg-[#1F2933] max-w-sm w-full p-6 rounded-3xl border border-[#6B7280]/20 dark:border-[#D1D5DB]/15 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#6B7280]/15 dark:border-[#D1D5DB]/15">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-[#A68A64]" />
                <h4 className="text-sm font-bold text-[#1F2933] dark:text-[#F7F7F2]">
                  راهنمای نصب روی صفحه اصلی
                </h4>
              </div>
              <button
                onClick={() => setShowGuide(false)}
                className="p-1.5 text-[#6B7280] hover:text-[#1F2933] dark:text-[#D1D5DB] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 rounded-xl transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#1F2933] dark:text-[#D1D5DB] leading-relaxed">
              <div className="p-3.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-[#6B7280]/15 dark:border-[#D1D5DB]/15 space-y-1.5">
                <span className="font-bold text-[#A68A64] block">
                  در گوشی‌های اندروید (Chrome / Samsung):
                </span>
                <p>
                  ۱. روی دکمه ۳ نقطه (منو) در بالای مرورگر ضربه بزنید.
                  <br />
                  ۲. گزینه <b>«نصب برنامه» (Install App)</b> یا <b>«افزودن به صفحه اصلی» (Add to Home screen)</b> را انتخاب کنید.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#A68A64]/10 border border-[#A68A64]/25 space-y-1.5">
                <span className="font-bold text-[#A68A64] block">
                  در گوشی‌های آیفون (Safari):
                </span>
                <p>
                  ۱. دکمه اشتراک‌گذاری (<Share className="inline w-3 h-3 mx-0.5" /> Share) را بزنید.
                  <br />
                  ۲. گزینه <b>«Add to Home Screen»</b> را انتخاب کنید.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowGuide(false)}
              className="w-full py-2.5 rounded-xl bg-[#A68A64] hover:bg-[#8A704C] text-[#F7F7F2] font-bold text-xs shadow-md shadow-[#A68A64]/25 transition"
            >
              متوجه شدم
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default InstallPrompt;


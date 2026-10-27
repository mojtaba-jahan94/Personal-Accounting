import React, { useState, useEffect, Suspense, lazy, useRef, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { AuthView } from './components/auth/AuthView';
import { Header } from './components/layout/Header';
import { Sidebar, TabType } from './components/layout/Sidebar';
import { BottomNav } from './components/layout/BottomNav';
import { InstallPrompt } from './components/layout/InstallPrompt';
import { DashboardView } from './components/dashboard/DashboardView';
import { TransactionModal } from './components/transactions/TransactionModal';
import { TransferModal } from './components/accounts/TransferModal';
import { MinimalBackground } from './components/common/MinimalBackground';
import { SilkWaveBackground } from './components/common/SilkWaveBackground';
import { Transaction } from './types';

// Code-split views for optimal bundle loading & performance
const TransactionList = lazy(() => import('./components/transactions/TransactionList').then(m => ({ default: m.TransactionList })));
const AssetsView = lazy(() => import('./components/assets/AssetsView').then(m => ({ default: m.AssetsView })));
const AccountsView = lazy(() => import('./components/accounts/AccountsView').then(m => ({ default: m.AccountsView })));
const BudgetView = lazy(() => import('./components/budget/BudgetView').then(m => ({ default: m.BudgetView })));
const GoalsView = lazy(() => import('./components/goals/GoalsView').then(m => ({ default: m.GoalsView })));
const DebtsAndChequesView = lazy(() => import('./components/debts/DebtsAndChequesView').then(m => ({ default: m.DebtsAndChequesView })));
const ReportsView = lazy(() => import('./components/reports/ReportsView').then(m => ({ default: m.ReportsView })));
const SettingsView = lazy(() => import('./components/settings/SettingsView').then(m => ({ default: m.SettingsView })));
const SMSAssistantModal = lazy(() => import('./components/transactions/SMSAssistantModal').then(m => ({ default: m.SMSAssistantModal })));

const ALL_TABS: TabType[] = [
  'dashboard',
  'transactions',
  'assets',
  'reports',
  'accounts',
  'budgets',
  'goals',
  'debts',
  'settings',
];

const ViewLoadingFallback: React.FC = () => (
  <div className="w-full space-y-4 animate-pulse select-none">
    <div className="h-28 rounded-3xl bg-white/[0.03] border border-white/5" />
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="h-32 rounded-3xl bg-white/[0.03] border border-white/5" />
      <div className="h-32 rounded-3xl bg-white/[0.03] border border-white/5" />
      <div className="h-32 rounded-3xl bg-white/[0.03] border border-white/5" />
    </div>
    <div className="h-64 rounded-3xl bg-white/[0.03] border border-white/5" />
  </div>
);

const MainApp: React.FC = () => {
  const { themeConfig, conflictNotice, dismissConflictNotice } = useFinance();
  const [currentTab, setCurrentTab] = useState<TabType>('dashboard');
  const [slideDirection, setSlideDirection] = useState<'forward' | 'backward' | 'default'>('default');
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isSmsModalOpen, setIsSmsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Preserve scroll position per tab
  const scrollPosByTabRef = useRef<Record<string, number>>({});

  // Directional tab switching with smooth transition and scroll restoration
  const handleSelectTab = useCallback((newTab: TabType) => {
    if (newTab === currentTab) return;

    // Save current scroll position
    scrollPosByTabRef.current[currentTab] = window.scrollY;

    const oldIndex = ALL_TABS.indexOf(currentTab);
    const newIndex = ALL_TABS.indexOf(newTab);
    if (oldIndex !== -1 && newIndex !== -1) {
      setSlideDirection(newIndex > oldIndex ? 'forward' : 'backward');
    } else {
      setSlideDirection('default');
    }
    setCurrentTab(newTab);

    // Restore scroll position on next microtask
    requestAnimationFrame(() => {
      const savedY = scrollPosByTabRef.current[newTab] || 0;
      window.scrollTo({ top: savedY, behavior: 'instant' as ScrollBehavior });
    });
  }, [currentTab]);

  const handleSwipeNext = useCallback(() => {
    const currentIndex = ALL_TABS.indexOf(currentTab);
    if (currentIndex !== -1 && currentIndex < ALL_TABS.length - 1) {
      handleSelectTab(ALL_TABS[currentIndex + 1]);
    }
  }, [currentTab, handleSelectTab]);

  const handleSwipePrev = useCallback(() => {
    const currentIndex = ALL_TABS.indexOf(currentTab);
    if (currentIndex > 0) {
      handleSelectTab(ALL_TABS[currentIndex - 1]);
    }
  }, [currentTab, handleSelectTab]);

  // Touch swipe gesture handlers for full-page sliding
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    const target = e.target as HTMLElement | null;
    if (
      target &&
      target.closest('input[type="range"], .overflow-x-auto, [data-no-swipe], dialog')
    ) {
      touchStartX.current = null;
      touchStartY.current = null;
      return;
    }
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;
    touchStartX.current = null;
    touchStartY.current = null;

    if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY) * 1.3) {
      if (deltaX < 0) {
        // RTL swipe right-to-left: next page
        handleSwipeNext();
      } else {
        // RTL swipe left-to-right: previous page
        handleSwipePrev();
      }
    }
  };

  useEffect(() => {
    // Preload views in idle time so switching tabs is instant without rendering or scroll lag
    const preloadViews = () => {
      import('./components/transactions/TransactionList');
      import('./components/assets/AssetsView');
      import('./components/reports/ReportsView');
      import('./components/accounts/AccountsView');
      import('./components/budget/BudgetView');
      import('./components/goals/GoalsView');
      import('./components/debts/DebtsAndChequesView');
      import('./components/settings/SettingsView');
    };

    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(preloadViews);
    } else {
      setTimeout(preloadViews, 100);
    }

    const params = new URLSearchParams(window.location.search);
    const sharedText = params.get('text') || params.get('title');
    if (sharedText) {
      setIsSmsModalOpen(true);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleOpenTransactionModal = (tx?: Transaction) => {
    setEditingTransaction(tx || null);
    setIsTransactionModalOpen(true);
  };

  const renderCurrentView = () => {
    switch (currentTab) {
      case 'dashboard':
        return (
          <DashboardView
            onSelectTab={handleSelectTab}
            onOpenTransactionModal={() => handleOpenTransactionModal()}
            onOpenTransferModal={() => setIsTransferModalOpen(true)}
          />
        );
      case 'transactions':
        return (
          <Suspense fallback={<ViewLoadingFallback />}>
            <TransactionList
              onOpenTransactionModal={handleOpenTransactionModal}
            />
          </Suspense>
        );
      case 'assets':
        return (
          <Suspense fallback={<ViewLoadingFallback />}>
            <AssetsView />
          </Suspense>
        );
      case 'accounts':
        return (
          <Suspense fallback={<ViewLoadingFallback />}>
            <AccountsView onSelectTab={handleSelectTab} />
          </Suspense>
        );
      case 'budgets':
        return (
          <Suspense fallback={<ViewLoadingFallback />}>
            <BudgetView />
          </Suspense>
        );
      case 'goals':
        return (
          <Suspense fallback={<ViewLoadingFallback />}>
            <GoalsView />
          </Suspense>
        );
      case 'debts':
        return (
          <Suspense fallback={<ViewLoadingFallback />}>
            <DebtsAndChequesView />
          </Suspense>
        );
      case 'reports':
        return (
          <Suspense fallback={<ViewLoadingFallback />}>
            <ReportsView />
          </Suspense>
        );
      case 'settings':
        return (
          <Suspense fallback={<ViewLoadingFallback />}>
            <SettingsView />
          </Suspense>
        );
      default:
        return (
          <DashboardView
            onSelectTab={handleSelectTab}
            onOpenTransactionModal={() => handleOpenTransactionModal()}
            onOpenTransferModal={() => setIsTransferModalOpen(true)}
          />
        );
    }
  };

  const animationClass =
    slideDirection === 'forward'
      ? 'animate-view-slide-forward'
      : slideDirection === 'backward'
      ? 'animate-view-slide-backward'
      : 'animate-view-transition';

  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col transition-colors relative bg-fintech-bg text-fintech-text-main">
      {/* Ambient background: Silk Wave or Clean Minimal Nordic */}
      {themeConfig.backgroundStyle === 'silk_wave' ? (
        <SilkWaveBackground />
      ) : (
        <MinimalBackground />
      )}

      <Header
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        onToggleMobileSidebar={() => setIsMobileDrawerOpen((p) => !p)}
        onOpenTransactionModal={() => handleOpenTransactionModal()}
        onOpenTransferModal={() => setIsTransferModalOpen(true)}
        onOpenSmsModal={() => setIsSmsModalOpen(true)}
      />

      {conflictNotice && (
        <div className="max-w-7xl mx-auto w-full px-3 sm:px-6 mt-2 z-50">
          <div className="bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-200 px-4 py-2.5 rounded-2xl text-xs sm:text-sm flex items-center justify-between shadow-sm">
            <span>{conflictNotice}</span>
            <button
              onClick={dismissConflictNotice}
              className="text-xs bg-amber-500/20 hover:bg-amber-500/30 text-amber-900 dark:text-amber-100 px-2.5 py-1 rounded-xl transition-colors font-medium mr-2"
            >
              متوجه شدم
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 flex max-w-7xl w-full mx-auto relative z-10">
        <Sidebar
          currentTab={currentTab}
          onSelectTab={handleSelectTab}
          isMobileDrawerOpen={isMobileDrawerOpen}
          onCloseMobileDrawer={() => setIsMobileDrawerOpen(false)}
        />

        <main
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="flex-1 p-3 sm:p-6 lg:p-8 min-w-0 pb-28 lg:pb-10 overflow-x-hidden touch-pan-y"
        >
          <div key={currentTab} className="w-full animate-page-enter">
            {renderCurrentView()}
          </div>
        </main>
      </div>

      <BottomNav
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        onOpenTransactionModal={() => handleOpenTransactionModal()}
        onSwipeNext={handleSwipeNext}
        onSwipePrev={handleSwipePrev}
      />

      <InstallPrompt />

      <TransactionModal
        isOpen={isTransactionModalOpen}
        onClose={() => {
          setIsTransactionModalOpen(false);
          setEditingTransaction(null);
        }}
        initialTransaction={editingTransaction}
      />

      <TransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
      />

      {isSmsModalOpen && (
        <Suspense fallback={null}>
          <SMSAssistantModal
            isOpen={isSmsModalOpen}
            onClose={() => setIsSmsModalOpen(false)}
          />
        </Suspense>
      )}
    </div>
  );
};

const AuthenticatedApp: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#0A0A0C] text-[#F4F0EA]" dir="rtl">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-3 border-[#DFC296] border-t-transparent animate-spin" />
          <span className="text-xs font-bold text-[#8E8B82]">در حال بررسی اطلاعات کاربری...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthView />;
  }

  return (
    <FinanceProvider>
      <MainApp />
    </FinanceProvider>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AuthenticatedApp />
    </AuthProvider>
  );
};

export default App;

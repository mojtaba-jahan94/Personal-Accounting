import React, { useState, useEffect, Suspense, lazy, useRef, useCallback } from 'react';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { Header } from './components/layout/Header';
import { Sidebar, TabType } from './components/layout/Sidebar';
import { BottomNav } from './components/layout/BottomNav';
import { InstallPrompt } from './components/layout/InstallPrompt';
import { DashboardView } from './components/dashboard/DashboardView';
import { TransactionModal } from './components/transactions/TransactionModal';
import { TransferModal } from './components/accounts/TransferModal';
import { MinimalBackground } from './components/common/MinimalBackground';
import { Transaction } from './types';

// Code-split views for optimal bundle loading & performance
const TransactionList = lazy(() => import('./components/transactions/TransactionList').then(m => ({ default: m.TransactionList })));
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
  'reports',
  'accounts',
  'budgets',
  'goals',
  'debts',
  'settings',
];

const ViewLoadingFallback: React.FC = () => (
  <div className="flex items-center justify-center min-h-[300px] w-full">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
      <span className="text-xs font-bold text-slate-500 dark:text-slate-400">در حال بارگذاری...</span>
    </div>
  </div>
);

const MainApp: React.FC = () => {
  const { themeConfig } = useFinance();
  const [currentTab, setCurrentTab] = useState<TabType>('dashboard');
  const [slideDirection, setSlideDirection] = useState<'forward' | 'backward' | 'default'>('default');
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isSmsModalOpen, setIsSmsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Directional tab switching with smooth transition
  const handleSelectTab = useCallback((newTab: TabType) => {
    if (newTab === currentTab) return;
    const oldIndex = ALL_TABS.indexOf(currentTab);
    const newIndex = ALL_TABS.indexOf(newTab);
    if (oldIndex !== -1 && newIndex !== -1) {
      setSlideDirection(newIndex > oldIndex ? 'forward' : 'backward');
    } else {
      setSlideDirection('default');
    }
    setCurrentTab(newTab);
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
      case 'accounts':
        return (
          <Suspense fallback={<ViewLoadingFallback />}>
            <AccountsView />
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

  return (
    <div className="min-h-screen flex flex-col transition-colors relative">
      {/* Minimal clean ambient background */}
      <MinimalBackground />

      <Header
        onOpenTransactionModal={() => handleOpenTransactionModal()}
        onOpenTransferModal={() => setIsTransferModalOpen(true)}
        onOpenSmsModal={() => setIsSmsModalOpen(true)}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto relative z-10">
        <Sidebar currentTab={currentTab} onSelectTab={handleSelectTab} />

        <main
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 pb-28 lg:pb-12 overflow-x-hidden touch-pan-y"
        >
          <div key={currentTab} className={`w-full ${animationClass}`}>
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

export const App: React.FC = () => {
  return (
    <FinanceProvider>
      <MainApp />
    </FinanceProvider>
  );
};

export default App;

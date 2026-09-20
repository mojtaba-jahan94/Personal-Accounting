import React, { useState, useEffect, Suspense, lazy } from 'react';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { Header } from './components/layout/Header';
import { Sidebar, TabType } from './components/layout/Sidebar';
import { BottomNav } from './components/layout/BottomNav';
import { InstallPrompt } from './components/layout/InstallPrompt';
import { DashboardView } from './components/dashboard/DashboardView';
import { TransactionModal } from './components/transactions/TransactionModal';
import { TransferModal } from './components/accounts/TransferModal';
import { SilkWaveBackground } from './components/common/SilkWaveBackground';
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
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isSmsModalOpen, setIsSmsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  useEffect(() => {
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
            onSelectTab={setCurrentTab}
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
            onSelectTab={setCurrentTab}
            onOpenTransactionModal={() => handleOpenTransactionModal()}
            onOpenTransferModal={() => setIsTransferModalOpen(true)}
          />
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col transition-colors relative">
      {/* 3D Fluid Silk Ribbon Background matching the reference photo */}
      <SilkWaveBackground />

      <Header
        onOpenTransactionModal={() => handleOpenTransactionModal()}
        onOpenTransferModal={() => setIsTransferModalOpen(true)}
        onOpenSmsModal={() => setIsSmsModalOpen(true)}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto relative z-10">
        <Sidebar currentTab={currentTab} onSelectTab={setCurrentTab} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 pb-24 lg:pb-12">
          {renderCurrentView()}
        </main>
      </div>

      <BottomNav
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenTransactionModal={() => handleOpenTransactionModal()}
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

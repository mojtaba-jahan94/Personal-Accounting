import React, { useState, useEffect, Suspense, lazy } from 'react';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { Header } from './components/layout/Header';
import { Sidebar, TabType } from './components/layout/Sidebar';
import { BottomNav } from './components/layout/BottomNav';
import { InstallPrompt } from './components/layout/InstallPrompt';
import { DashboardView } from './components/dashboard/DashboardView';
import { TransactionModal } from './components/transactions/TransactionModal';
import { TransferModal } from './components/accounts/TransferModal';
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
      {/* Liquid Azure / Oceanic Ribbons Background Layer (Matching Reference Photo) */}
      <div data-dynamic className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {/* Upper Fluid Azure Ribbon */}
        <div
          className="ambient-orb absolute -top-20 -right-1/4 w-[140vw] sm:w-[100vw] h-[55vh] sm:h-[75vh] rounded-[45%] bg-gradient-to-tr from-blue-600/45 via-cyan-400/35 to-indigo-600/30 dark:from-blue-600/50 dark:via-cyan-400/35 dark:to-purple-600/40 blur-[60px] sm:blur-[95px] animate-float-optimized"
          style={{ transform: 'rotate(-16deg)' }}
        />
        {/* Middle Vibrant Wave Ribbon */}
        <div
          className="ambient-orb absolute top-1/4 -left-1/4 w-[140vw] sm:w-[110vw] h-[60vh] sm:h-[80vh] rounded-[40%] bg-gradient-to-br from-indigo-600/30 via-sky-400/45 to-teal-400/30 dark:from-indigo-700/40 dark:via-sky-500/35 dark:to-cyan-400/25 blur-[70px] sm:blur-[105px] animate-float-alt"
          style={{ transform: 'rotate(12deg)', animationDelay: '2s' }}
        />
        {/* Lower Oceanic Wave Pool */}
        <div
          className="ambient-orb absolute -bottom-24 left-1/4 w-[110vw] h-[55vh] sm:h-[70vh] rounded-[50%] bg-gradient-to-t from-cyan-500/30 via-blue-600/35 to-purple-600/25 dark:from-cyan-600/30 dark:via-blue-700/45 dark:to-purple-700/35 blur-[80px] sm:blur-[115px] animate-float-optimized"
          style={{ animationDelay: '4s' }}
        />
      </div>

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

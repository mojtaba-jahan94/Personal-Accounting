import React, { useState, useEffect } from 'react';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { Header } from './components/layout/Header';
import { Sidebar, TabType } from './components/layout/Sidebar';
import { BottomNav } from './components/layout/BottomNav';
import { InstallPrompt } from './components/layout/InstallPrompt';
import { DashboardView } from './components/dashboard/DashboardView';
import { TransactionList } from './components/transactions/TransactionList';
import { TransactionModal } from './components/transactions/TransactionModal';
import { AccountsView } from './components/accounts/AccountsView';
import { TransferModal } from './components/accounts/TransferModal';
import { InvestmentsView } from './components/investments/InvestmentsView';
import { BudgetView } from './components/budget/BudgetView';
import { GoalsView } from './components/goals/GoalsView';
import { DebtsAndChequesView } from './components/debts/DebtsAndChequesView';
import { ReportsView } from './components/reports/ReportsView';
import { SettingsView } from './components/settings/SettingsView';
import { SMSAssistantModal } from './components/transactions/SMSAssistantModal';
import { Transaction } from './types';

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
          <TransactionList
            onOpenTransactionModal={handleOpenTransactionModal}
          />
        );
      case 'accounts':
        return <AccountsView />;
      case 'investments':
        return <InvestmentsView />;
      case 'budgets':
        return <BudgetView />;
      case 'goals':
        return <GoalsView />;
      case 'debts':
        return <DebtsAndChequesView />;
      case 'reports':
        return <ReportsView />;
      case 'settings':
        return <SettingsView />;
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
      {/* Ambient Lighting Orbs */}
      {themeConfig.ambientOrbs && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute -top-32 -left-32 w-80 sm:w-96 h-80 sm:h-96 bg-indigo-500/15 dark:bg-indigo-600/20 rounded-full blur-3xl animate-float-optimized" />
          <div
            className="absolute top-1/3 -right-32 w-80 sm:w-96 h-80 sm:h-96 bg-purple-500/12 dark:bg-purple-600/15 rounded-full blur-3xl animate-float-optimized"
            style={{ animationDelay: '2s' }}
          />
          <div
            className="absolute -bottom-32 left-1/4 w-80 sm:w-96 h-80 sm:h-96 bg-emerald-500/12 dark:bg-emerald-600/12 rounded-full blur-3xl animate-float-optimized"
            style={{ animationDelay: '4s' }}
          />
        </div>
      )}

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

      <SMSAssistantModal
        isOpen={isSmsModalOpen}
        onClose={() => setIsSmsModalOpen(false)}
      />
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

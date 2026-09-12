import React, { useState } from 'react';
import { FinanceProvider } from './context/FinanceContext';
import { Header } from './components/layout/Header';
import { Sidebar, TabType } from './components/layout/Sidebar';
import { BottomNav } from './components/layout/BottomNav';
import { DashboardView } from './components/dashboard/DashboardView';
import { TransactionList } from './components/transactions/TransactionList';
import { TransactionModal } from './components/transactions/TransactionModal';
import { AccountsView } from './components/accounts/AccountsView';
import { TransferModal } from './components/accounts/TransferModal';
import { BudgetView } from './components/budget/BudgetView';
import { GoalsView } from './components/goals/GoalsView';
import { DebtsAndChequesView } from './components/debts/DebtsAndChequesView';
import { ReportsView } from './components/reports/ReportsView';
import { SettingsView } from './components/settings/SettingsView';
import { Transaction } from './types';

const MainApp: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<TabType>('dashboard');
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

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
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors">
      <Header
        onOpenTransactionModal={() => handleOpenTransactionModal()}
        onOpenTransferModal={() => setIsTransferModalOpen(true)}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Desktop Sidebar */}
        <Sidebar currentTab={currentTab} onSelectTab={setCurrentTab} />

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 pb-24 lg:pb-12">
          {renderCurrentView()}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenTransactionModal={() => handleOpenTransactionModal()}
      />

      {/* Modals */}
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

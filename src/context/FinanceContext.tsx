import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Account,
  Category,
  Transaction,
  Budget,
  Goal,
  Debt,
  Cheque,
  Currency,
} from '../types';
import { DEFAULT_ACCOUNTS, DEFAULT_CATEGORIES, getDemoData } from '../utils/sampleData';

interface FinanceContextType {
  accounts: Account[];
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  goals: Goal[];
  debts: Debt[];
  cheques: Cheque[];
  currency: Currency;
  darkMode: boolean;

  // Actions
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  updateTransaction: (tx: Transaction) => void;
  deleteTransaction: (id: string) => void;

  addAccount: (acc: Omit<Account, 'id'>) => void;
  updateAccount: (acc: Account) => void;
  deleteAccount: (id: string) => void;

  addCategory: (cat: Omit<Category, 'id'>) => void;
  deleteCategory: (id: string) => void;

  addBudget: (b: Omit<Budget, 'id'>) => void;
  updateBudget: (b: Budget) => void;
  deleteBudget: (id: string) => void;

  addGoal: (g: Omit<Goal, 'id'>) => void;
  updateGoal: (g: Goal) => void;
  deleteGoal: (id: string) => void;
  contributeToGoal: (id: string, amount: number, accountId?: string) => void;

  addDebt: (d: Omit<Debt, 'id'>) => void;
  updateDebt: (d: Debt) => void;
  deleteDebt: (id: string) => void;
  payDebt: (id: string, amount: number) => void;

  addCheque: (ch: Omit<Cheque, 'id'>) => void;
  updateCheque: (ch: Cheque) => void;
  deleteCheque: (id: string) => void;
  changeChequeStatus: (id: string, status: Cheque['status']) => void;

  setCurrency: (c: Currency) => void;
  toggleDarkMode: () => void;
  loadDemoData: () => void;
  exportDataJSON: () => string;
  importDataJSON: (jsonStr: string) => boolean;
  clearAllData: () => void;

  // Computed values
  totalBalance: number;
  totalIncome: number;
  totalExpense: number;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

const STORAGE_KEYS = {
  ACCOUNTS: 'pf_accounts_v1',
  TRANSACTIONS: 'pf_transactions_v1',
  CATEGORIES: 'pf_categories_v1',
  BUDGETS: 'pf_budgets_v1',
  GOALS: 'pf_goals_v1',
  DEBTS: 'pf_debts_v1',
  CHEQUES: 'pf_cheques_v1',
  CURRENCY: 'pf_currency_v1',
  THEME: 'pf_theme_v1',
};

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accounts, setAccounts] = useState<Account[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
    return saved ? JSON.parse(saved) : DEFAULT_ACCOUNTS;
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (saved) return JSON.parse(saved);
    // If first time, load demo data so app is not completely empty
    const demo = getDemoData();
    return demo.transactions;
  });

  const [budgets, setBudgets] = useState<Budget[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.BUDGETS);
    if (saved) return JSON.parse(saved);
    const demo = getDemoData();
    return demo.budgets;
  });

  const [goals, setGoals] = useState<Goal[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.GOALS);
    if (saved) return JSON.parse(saved);
    const demo = getDemoData();
    return demo.goals;
  });

  const [debts, setDebts] = useState<Debt[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DEBTS);
    if (saved) return JSON.parse(saved);
    const demo = getDemoData();
    return demo.debts;
  });

  const [cheques, setCheques] = useState<Cheque[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CHEQUES);
    if (saved) return JSON.parse(saved);
    const demo = getDemoData();
    return demo.cheques;
  });

  const [currency, setCurrency] = useState<Currency>(() => {
    return (localStorage.getItem(STORAGE_KEYS.CURRENCY) as Currency) || 'toman';
  });

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME);
    if (saved !== null) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
  }, [budgets]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DEBTS, JSON.stringify(debts));
  }, [debts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CHEQUES, JSON.stringify(cheques));
  }, [cheques]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENCY, currency);
  }, [currency]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.THEME, darkMode ? 'dark' : 'light');
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(prev => !prev);

  // Transaction Actions with Account Balance update
  const addTransaction = (tx: Omit<Transaction, 'id'>) => {
    const id = 'tx-' + Date.now();
    const newTx: Transaction = { ...tx, id };

    // Update account balances
    setAccounts(prev =>
      prev.map(acc => {
        if (newTx.type === 'expense' && acc.id === newTx.accountId) {
          return { ...acc, balance: acc.balance - newTx.amount };
        }
        if (newTx.type === 'income' && acc.id === newTx.accountId) {
          return { ...acc, balance: acc.balance + newTx.amount };
        }
        if (newTx.type === 'transfer') {
          if (acc.id === newTx.accountId) {
            const fee = newTx.fee || 0;
            return { ...acc, balance: acc.balance - (newTx.amount + fee) };
          }
          if (acc.id === newTx.toAccountId) {
            return { ...acc, balance: acc.balance + newTx.amount };
          }
        }
        return acc;
      })
    );

    setTransactions(prev => [newTx, ...prev]);
  };

  const updateTransaction = (updatedTx: Transaction) => {
    // Revert old transaction effect, apply new transaction effect
    const oldTx = transactions.find(t => t.id === updatedTx.id);
    if (!oldTx) return;

    setAccounts(prev => {
      let accs = [...prev];
      // 1. Revert old
      accs = accs.map(acc => {
        if (oldTx.type === 'expense' && acc.id === oldTx.accountId) {
          return { ...acc, balance: acc.balance + oldTx.amount };
        }
        if (oldTx.type === 'income' && acc.id === oldTx.accountId) {
          return { ...acc, balance: acc.balance - oldTx.amount };
        }
        if (oldTx.type === 'transfer') {
          if (acc.id === oldTx.accountId) {
            return { ...acc, balance: acc.balance + (oldTx.amount + (oldTx.fee || 0)) };
          }
          if (acc.id === oldTx.toAccountId) {
            return { ...acc, balance: acc.balance - oldTx.amount };
          }
        }
        return acc;
      });

      // 2. Apply new
      accs = accs.map(acc => {
        if (updatedTx.type === 'expense' && acc.id === updatedTx.accountId) {
          return { ...acc, balance: acc.balance - updatedTx.amount };
        }
        if (updatedTx.type === 'income' && acc.id === updatedTx.accountId) {
          return { ...acc, balance: acc.balance + updatedTx.amount };
        }
        if (updatedTx.type === 'transfer') {
          if (acc.id === updatedTx.accountId) {
            return { ...acc, balance: acc.balance - (updatedTx.amount + (updatedTx.fee || 0)) };
          }
          if (acc.id === updatedTx.toAccountId) {
            return { ...acc, balance: acc.balance + updatedTx.amount };
          }
        }
        return acc;
      });
      return accs;
    });

    setTransactions(prev => prev.map(t => (t.id === updatedTx.id ? updatedTx : t)));
  };

  const deleteTransaction = (id: string) => {
    const tx = transactions.find(t => t.id === id);
    if (tx) {
      // Revert account balance effect
      setAccounts(prev =>
        prev.map(acc => {
          if (tx.type === 'expense' && acc.id === tx.accountId) {
            return { ...acc, balance: acc.balance + tx.amount };
          }
          if (tx.type === 'income' && acc.id === tx.accountId) {
            return { ...acc, balance: acc.balance - tx.amount };
          }
          if (tx.type === 'transfer') {
            if (acc.id === tx.accountId) {
              return { ...acc, balance: acc.balance + (tx.amount + (tx.fee || 0)) };
            }
            if (acc.id === tx.toAccountId) {
              return { ...acc, balance: acc.balance - tx.amount };
            }
          }
          return acc;
        })
      );
    }
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  // Account Actions
  const addAccount = (acc: Omit<Account, 'id'>) => {
    const newAcc: Account = { ...acc, id: 'acc-' + Date.now() };
    setAccounts(prev => [...prev, newAcc]);
  };

  const updateAccount = (acc: Account) => {
    setAccounts(prev => prev.map(a => (a.id === acc.id ? acc : a)));
  };

  const deleteAccount = (id: string) => {
    setAccounts(prev => prev.filter(a => a.id !== id));
  };

  // Category Actions
  const addCategory = (cat: Omit<Category, 'id'>) => {
    const newCat: Category = { ...cat, id: 'cat-' + Date.now() };
    setCategories(prev => [...prev, newCat]);
  };

  const deleteCategory = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  // Budget Actions
  const addBudget = (b: Omit<Budget, 'id'>) => {
    const newB: Budget = { ...b, id: 'b-' + Date.now() };
    setBudgets(prev => [...prev, newB]);
  };

  const updateBudget = (b: Budget) => {
    setBudgets(prev => prev.map(item => (item.id === b.id ? b : item)));
  };

  const deleteBudget = (id: string) => {
    setBudgets(prev => prev.filter(b => b.id !== id));
  };

  // Goals
  const addGoal = (g: Omit<Goal, 'id'>) => {
    const newG: Goal = { ...g, id: 'g-' + Date.now() };
    setGoals(prev => [...prev, newG]);
  };

  const updateGoal = (g: Goal) => {
    setGoals(prev => prev.map(item => (item.id === g.id ? g : item)));
  };

  const deleteGoal = (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  const contributeToGoal = (id: string, amount: number, accountId?: string) => {
    setGoals(prev =>
      prev.map(g => (g.id === id ? { ...g, currentAmount: g.currentAmount + amount } : g))
    );
    if (accountId) {
      // Deduct from account balance as an expense or goal savings transfer
      setAccounts(prev =>
        prev.map(a => (a.id === accountId ? { ...a, balance: a.balance - amount } : a))
      );
    }
  };

  // Debts
  const addDebt = (d: Omit<Debt, 'id'>) => {
    const newD: Debt = { ...d, id: 'd-' + Date.now() };
    setDebts(prev => [...prev, newD]);
  };

  const updateDebt = (d: Debt) => {
    setDebts(prev => prev.map(item => (item.id === d.id ? d : item)));
  };

  const deleteDebt = (id: string) => {
    setDebts(prev => prev.filter(d => d.id !== id));
  };

  const payDebt = (id: string, amount: number) => {
    setDebts(prev =>
      prev.map(d => {
        if (d.id === id) {
          const paidAmount = d.paidAmount + amount;
          return {
            ...d,
            paidAmount,
            isSettled: paidAmount >= d.amount,
          };
        }
        return d;
      })
    );
  };

  // Cheques
  const addCheque = (ch: Omit<Cheque, 'id'>) => {
    const newCh: Cheque = { ...ch, id: 'ch-' + Date.now() };
    setCheques(prev => [...prev, newCh]);
  };

  const updateCheque = (ch: Cheque) => {
    setCheques(prev => prev.map(item => (item.id === ch.id ? ch : item)));
  };

  const deleteCheque = (id: string) => {
    setCheques(prev => prev.filter(ch => ch.id !== id));
  };

  const changeChequeStatus = (id: string, status: Cheque['status']) => {
    setCheques(prev => prev.map(ch => (ch.id === id ? { ...ch, status } : ch)));
  };

  // Demo data and Backup
  const loadDemoData = () => {
    const demo = getDemoData();
    setAccounts(demo.accounts);
    setTransactions(demo.transactions);
    setBudgets(demo.budgets);
    setGoals(demo.goals);
    setDebts(demo.debts);
    setCheques(demo.cheques);
  };

  const exportDataJSON = (): string => {
    const data = {
      version: 1,
      exportDate: new Date().toISOString(),
      accounts,
      transactions,
      categories,
      budgets,
      goals,
      debts,
      cheques,
      currency,
    };
    return JSON.stringify(data, null, 2);
  };

  const importDataJSON = (jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (data.accounts) setAccounts(data.accounts);
      if (data.transactions) setTransactions(data.transactions);
      if (data.categories) setCategories(data.categories);
      if (data.budgets) setBudgets(data.budgets);
      if (data.goals) setGoals(data.goals);
      if (data.debts) setDebts(data.debts);
      if (data.cheques) setCheques(data.cheques);
      if (data.currency) setCurrency(data.currency);
      return true;
    } catch (e) {
      console.error('Error importing backup:', e);
      return false;
    }
  };

  const clearAllData = () => {
    setTransactions([]);
    setBudgets([]);
    setGoals([]);
    setDebts([]);
    setCheques([]);
    setAccounts(DEFAULT_ACCOUNTS.map(a => ({ ...a, balance: 0 })));
  };

  // Computations
  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <FinanceContext.Provider
      value={{
        accounts,
        transactions,
        categories,
        budgets,
        goals,
        debts,
        cheques,
        currency,
        darkMode,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addAccount,
        updateAccount,
        deleteAccount,
        addCategory,
        deleteCategory,
        addBudget,
        updateBudget,
        deleteBudget,
        addGoal,
        updateGoal,
        deleteGoal,
        contributeToGoal,
        addDebt,
        updateDebt,
        deleteDebt,
        payDebt,
        addCheque,
        updateCheque,
        deleteCheque,
        changeChequeStatus,
        setCurrency,
        toggleDarkMode,
        loadDemoData,
        exportDataJSON,
        importDataJSON,
        clearAllData,
        totalBalance,
        totalIncome,
        totalExpense,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};

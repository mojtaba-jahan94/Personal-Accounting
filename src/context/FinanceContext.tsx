import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  Account,
  Category,
  Transaction,
  Budget,
  Goal,
  Debt,
  Cheque,
  Currency,
  ThemeConfig,
  DashboardSectionConfig,
  Person,
  DebtPayment,
  TransactionType,
} from '../types';
import { DEFAULT_ACCOUNTS, DEFAULT_CATEGORIES, DEFAULT_PERSONS, getDemoData } from '../utils/sampleData';
import { getTodayJalali } from '../utils/jalali';

interface FinanceContextType {
  accounts: Account[];
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  goals: Goal[];
  debts: Debt[];
  cheques: Cheque[];
  persons: Person[];
  currency: Currency;
  darkMode: boolean;
  themeConfig: ThemeConfig;

  // Actions
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => void;
  updateTransaction: (tx: Transaction) => void;
  deleteTransaction: (id: string) => void;
  divideTransactionBy10: (txId: string) => void;
  multiplyTransactionBy10: (txId: string) => void;
  batchFixRialTransactions: () => number;
  convertAllDataCurrency: (factor: 0.1 | 10) => void;

  addAccount: (acc: Omit<Account, 'id'>) => void;
  updateAccount: (acc: Account) => void;
  deleteAccount: (id: string) => void;

  addCategory: (cat: Omit<Category, 'id'>) => void;
  updateCategory: (cat: Category) => void;
  deleteCategory: (id: string) => void;

  addPerson: (p: Omit<Person, 'id' | 'createdAt'>) => Person;
  updatePerson: (p: Person) => void;
  deletePerson: (id: string) => void;

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
  payDebtWithAccount: (params: {
    debtId: string;
    amount: number;
    accountId: string;
    date?: string;
    description?: string;
  }) => void;

  addCheque: (ch: Omit<Cheque, 'id'>) => void;
  updateCheque: (ch: Cheque) => void;
  deleteCheque: (id: string) => void;
  changeChequeStatus: (id: string, status: Cheque['status']) => void;

  setCurrency: (c: Currency) => void;
  toggleDarkMode: () => void;
  updateThemeConfig: (config: Partial<ThemeConfig>) => void;
  dashboardConfig: DashboardSectionConfig;
  updateDashboardConfig: (config: Partial<DashboardSectionConfig>) => void;
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
  CATEGORIES: 'pf_categories_v2',
  BUDGETS: 'pf_budgets_v1',
  GOALS: 'pf_goals_v1',
  DEBTS: 'pf_debts_v1',
  CHEQUES: 'pf_cheques_v1',
  PERSONS: 'pf_persons_v1',
  CURRENCY: 'pf_currency_v1',
  THEME_CONFIG: 'pf_theme_config_v2',
  DASHBOARD_CONFIG: 'pf_dashboard_config_v1',
};

export const DEFAULT_DASHBOARD_CONFIG: DashboardSectionConfig = {
  showHero: true,
  showKpiCards: true,
  showAccounts: true,
  showExpenseChart: true,
  showRecentTransactions: true,
  showBudgetProgress: true,
  showCheques: true,
  sectionOrder: [
    'showHero',
    'showKpiCards',
    'showAccounts',
    'showExpenseChart',
    'showRecentTransactions',
    'showBudgetProgress',
    'showCheques',
  ],
};

const DEFAULT_THEME_CONFIG: ThemeConfig = {
  mode: 'light',
  accent: 'indigo',
  customAccentHex: '#6366f1',
  amoledMode: false,
  liquidGlass: true,
  performanceMode: false,
  lightStyle: 'frost',
  backgroundStyle: 'clean_minimal',
  spotlight1Color: '#6366f1',
  spotlight2Color: '#06b6d4',
  glassIntensity: 'medium',
  glassOpacity: 0.85,
  glassBlur: 14,
  glassRefraction: 0.5,
  glassSaturation: 160,
  ambientOrbs: true,
  ambientGlow: 'subtle',
  animationSpeed: 'fast',
  borderRadius: 'smooth',
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

  const [persons, setPersons] = useState<Person[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PERSONS);
    return saved ? JSON.parse(saved) : DEFAULT_PERSONS;
  });

  const [currency, setCurrency] = useState<Currency>(() => {
    return (localStorage.getItem(STORAGE_KEYS.CURRENCY) as Currency) || 'toman';
  });

  const [themeConfig, setThemeConfig] = useState<ThemeConfig>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME_CONFIG);
    if (saved) {
      try {
        return { ...DEFAULT_THEME_CONFIG, ...JSON.parse(saved) };
      } catch (e) {
        return DEFAULT_THEME_CONFIG;
      }
    }
    return DEFAULT_THEME_CONFIG;
  });

  const darkMode = themeConfig.mode === 'dark';

  // Apply Theme Settings to Root Document
  useEffect(() => {
    const root = document.documentElement;
    if (themeConfig.mode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    if (themeConfig.amoledMode && themeConfig.mode === 'dark') {
      root.classList.add('amoled');
    } else {
      root.classList.remove('amoled');
    }

    // Liquid Glass On/Off
    if (themeConfig.liquidGlass === false || themeConfig.performanceMode) {
      root.classList.add('no-glass');
    } else {
      root.classList.remove('no-glass');
    }

    // Performance Mode (for mid-range phones)
    if (themeConfig.performanceMode) {
      root.classList.add('perf-mode');
    } else {
      root.classList.remove('perf-mode');
    }

    root.setAttribute('data-accent', themeConfig.accent);
    root.setAttribute('data-glass', themeConfig.glassIntensity);
    root.setAttribute('data-anim', themeConfig.animationSpeed);
    root.setAttribute('data-radius', themeConfig.borderRadius || 'smooth');
    root.setAttribute('data-glow', themeConfig.ambientGlow || 'subtle');
    root.setAttribute('data-light-style', themeConfig.lightStyle || 'frost');

    // Dynamic Glassmorphism Variables
    root.style.setProperty('--glass-bg-opacity', String(themeConfig.glassOpacity ?? 0.86));
    root.style.setProperty('--glass-blur', `${themeConfig.glassBlur ?? 14}px`);
    root.style.setProperty('--glass-refraction', String(themeConfig.glassRefraction ?? 0.5));
    root.style.setProperty('--glass-saturate', `${themeConfig.glassSaturation ?? 160}%`);

    // Dynamic Custom Accent Color if selected
    if (themeConfig.accent === 'custom' && themeConfig.customAccentHex) {
      const hex = themeConfig.customAccentHex;
      const r = parseInt(hex.slice(1, 3), 16) || 99;
      const g = parseInt(hex.slice(3, 5), 16) || 102;
      const b = parseInt(hex.slice(5, 7), 16) || 241;
      root.style.setProperty('--primary-color', hex);
      root.style.setProperty('--primary-rgb', `${r}, ${g}, ${b}`);
      root.style.setProperty('--primary-hover', hex);
      root.style.setProperty('--primary-glow', `rgba(${r}, ${g}, ${b}, 0.28)`);
    } else {
      root.style.removeProperty('--primary-color');
      root.style.removeProperty('--primary-rgb');
      root.style.removeProperty('--primary-hover');
      root.style.removeProperty('--primary-glow');
    }

    localStorage.setItem(STORAGE_KEYS.THEME_CONFIG, JSON.stringify(themeConfig));
  }, [themeConfig]);

  const toggleDarkMode = () => {
    setThemeConfig(prev => ({
      ...prev,
      mode: prev.mode === 'dark' ? 'light' : 'dark',
    }));
  };

  const updateThemeConfig = (updates: Partial<ThemeConfig>) => {
    setThemeConfig(prev => ({
      ...prev,
      ...updates,
    }));
  };

  const [dashboardConfig, setDashboardConfig] = useState<DashboardSectionConfig>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DASHBOARD_CONFIG);
    if (saved) {
      try {
        return { ...DEFAULT_DASHBOARD_CONFIG, ...JSON.parse(saved) };
      } catch {
        return DEFAULT_DASHBOARD_CONFIG;
      }
    }
    return DEFAULT_DASHBOARD_CONFIG;
  });

  const updateDashboardConfig = (updates: Partial<DashboardSectionConfig>) => {
    setDashboardConfig(prev => {
      const next = { ...prev, ...updates };
      localStorage.setItem(STORAGE_KEYS.DASHBOARD_CONFIG, JSON.stringify(next));
      return next;
    });
  };

  // Sync state to localStorage
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
    localStorage.setItem(STORAGE_KEYS.PERSONS, JSON.stringify(persons));
  }, [persons]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENCY, currency);
  }, [currency]);

  // Transaction Actions
  const addTransaction = (tx: Omit<Transaction, 'id'>) => {
    const id = 'tx-' + Date.now();
    const newTx: Transaction = { ...tx, id };

    setAccounts(prev =>
      prev.map(acc => {
        if (newTx.type === 'expense' && acc.id === newTx.accountId) {
          const fee = newTx.fee || 0;
          return { ...acc, balance: acc.balance - (newTx.amount + fee) };
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

    // If transaction is linked to a debt, automatically update the debt balance & history
    if (newTx.debtId) {
      setDebts(prev =>
        prev.map(d => {
          if (d.id === newTx.debtId) {
            const addedPaid = d.paidAmount + newTx.amount;
            const isSettled = addedPaid >= d.amount;
            const accName = accounts.find(a => a.id === newTx.accountId)?.name;
            const newPayment: DebtPayment = {
              id: 'dp-' + id,
              transactionId: id,
              amount: newTx.amount,
              date: newTx.date,
              accountId: newTx.accountId,
              accountName: accName,
              description: newTx.description,
            };
            return {
              ...d,
              paidAmount: addedPaid,
              isSettled,
              payments: [...(d.payments || []), newPayment],
            };
          }
          return d;
        })
      );
    }
  };

  const updateTransaction = (updatedTx: Transaction) => {
    const oldTx = transactions.find(t => t.id === updatedTx.id);
    if (!oldTx) return;

    setAccounts(prev => {
      let accs = [...prev];
      // 1. Revert old
      accs = accs.map(acc => {
        if (oldTx.type === 'expense' && acc.id === oldTx.accountId) {
          return { ...acc, balance: acc.balance + (oldTx.amount + (oldTx.fee || 0)) };
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
          return { ...acc, balance: acc.balance - (updatedTx.amount + (updatedTx.fee || 0)) };
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

    // 3. Sync debt updates
    if (oldTx.debtId || updatedTx.debtId) {
      setDebts(prev =>
        prev.map(d => {
          // If transaction moved away from this debt, revert payment
          if (d.id === oldTx.debtId && oldTx.debtId !== updatedTx.debtId) {
            const newPaid = Math.max(0, d.paidAmount - oldTx.amount);
            return {
              ...d,
              paidAmount: newPaid,
              isSettled: newPaid >= d.amount,
              payments: d.payments?.filter(p => p.transactionId !== updatedTx.id && p.id !== 'dp-' + updatedTx.id),
            };
          }
          // If transaction moved to this debt
          if (d.id === updatedTx.debtId && oldTx.debtId !== updatedTx.debtId) {
            const newPaid = d.paidAmount + updatedTx.amount;
            const accName = accounts.find(a => a.id === updatedTx.accountId)?.name;
            const newPayment: DebtPayment = {
              id: 'dp-' + updatedTx.id,
              transactionId: updatedTx.id,
              amount: updatedTx.amount,
              date: updatedTx.date,
              accountId: updatedTx.accountId,
              accountName: accName,
              description: updatedTx.description,
            };
            return {
              ...d,
              paidAmount: newPaid,
              isSettled: newPaid >= d.amount,
              payments: [...(d.payments || []), newPayment],
            };
          }
          // If transaction stayed with this debt, update amount and details
          if (d.id === updatedTx.debtId && oldTx.debtId === updatedTx.debtId) {
            const diff = updatedTx.amount - oldTx.amount;
            const newPaid = Math.max(0, d.paidAmount + diff);
            const accName = accounts.find(a => a.id === updatedTx.accountId)?.name;
            const updatedPayments = (d.payments || []).map(p => {
              if (p.transactionId === updatedTx.id || p.id === 'dp-' + updatedTx.id) {
                return {
                  ...p,
                  amount: updatedTx.amount,
                  date: updatedTx.date,
                  accountId: updatedTx.accountId,
                  accountName: accName,
                  description: updatedTx.description,
                };
              }
              return p;
            });
            return {
              ...d,
              paidAmount: newPaid,
              isSettled: newPaid >= d.amount,
              payments: updatedPayments,
            };
          }
          return d;
        })
      );
    }

    setTransactions(prev => prev.map(t => (t.id === updatedTx.id ? updatedTx : t)));
  };

  const deleteTransaction = (id: string) => {
    const tx = transactions.find(t => t.id === id);
    if (tx) {
      setAccounts(prev =>
        prev.map(acc => {
          if (tx.type === 'expense' && acc.id === tx.accountId) {
            return { ...acc, balance: acc.balance + (tx.amount + (tx.fee || 0)) };
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

      if (tx.debtId) {
        setDebts(prev =>
          prev.map(d => {
            if (d.id === tx.debtId) {
              const newPaid = Math.max(0, d.paidAmount - tx.amount);
              return {
                ...d,
                paidAmount: newPaid,
                isSettled: newPaid >= d.amount,
                payments: d.payments?.filter(p => p.transactionId !== id && p.id !== 'dp-' + id),
              };
            }
            return d;
          })
        );
      }
    }
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const divideTransactionBy10 = (txId: string) => {
    const tx = transactions.find(t => t.id === txId);
    if (!tx) return;
    const oldAmount = tx.amount;
    const newAmount = Math.round(oldAmount / 10);
    const diff = oldAmount - newAmount;

    const oldFee = tx.fee || 0;
    const newFee = tx.fee ? Math.round(tx.fee / 10) : undefined;
    const feeDiff = oldFee - (newFee || 0);

    setAccounts(prev =>
      prev.map(acc => {
        if (tx.type === 'expense' && acc.id === tx.accountId) {
          return { ...acc, balance: acc.balance + diff };
        }
        if (tx.type === 'income' && acc.id === tx.accountId) {
          return { ...acc, balance: acc.balance - diff };
        }
        if (tx.type === 'transfer') {
          if (acc.id === tx.accountId) {
            return { ...acc, balance: acc.balance + diff + feeDiff };
          }
          if (acc.id === tx.toAccountId) {
            return { ...acc, balance: acc.balance - diff };
          }
        }
        return acc;
      })
    );

    if (tx.debtId) {
      setDebts(prev =>
        prev.map(d => {
          if (d.id === tx.debtId) {
            const updatedPaid = Math.max(0, d.paidAmount - diff);
            return {
              ...d,
              paidAmount: updatedPaid,
              isSettled: updatedPaid >= d.amount,
            };
          }
          return d;
        })
      );
    }

    setTransactions(prev =>
      prev.map(t => (t.id === txId ? { ...t, amount: newAmount, fee: newFee } : t))
    );
  };

  const multiplyTransactionBy10 = (txId: string) => {
    const tx = transactions.find(t => t.id === txId);
    if (!tx) return;
    const oldAmount = tx.amount;
    const newAmount = Math.round(oldAmount * 10);
    const diff = newAmount - oldAmount;

    const oldFee = tx.fee || 0;
    const newFee = tx.fee ? Math.round(tx.fee * 10) : undefined;
    const feeDiff = (newFee || 0) - oldFee;

    setAccounts(prev =>
      prev.map(acc => {
        if (tx.type === 'expense' && acc.id === tx.accountId) {
          return { ...acc, balance: acc.balance - diff };
        }
        if (tx.type === 'income' && acc.id === tx.accountId) {
          return { ...acc, balance: acc.balance + diff };
        }
        if (tx.type === 'transfer') {
          if (acc.id === tx.accountId) {
            return { ...acc, balance: acc.balance - (diff + feeDiff) };
          }
          if (acc.id === tx.toAccountId) {
            return { ...acc, balance: acc.balance + diff };
          }
        }
        return acc;
      })
    );

    if (tx.debtId) {
      setDebts(prev =>
        prev.map(d => {
          if (d.id === tx.debtId) {
            const updatedPaid = d.paidAmount + diff;
            return {
              ...d,
              paidAmount: updatedPaid,
              isSettled: updatedPaid >= d.amount,
            };
          }
          return d;
        })
      );
    }

    setTransactions(prev =>
      prev.map(t => (t.id === txId ? { ...t, amount: newAmount, fee: newFee } : t))
    );
  };

  const batchFixRialTransactions = (): number => {
    let fixedCount = 0;
    const accountDeltas = new Map<string, number>();
    const debtDeltas = new Map<string, number>();

    const updatedTransactions = transactions.map(tx => {
      if (tx.amount >= 100000000) {
        fixedCount++;
        const newAmount = Math.round(tx.amount / 10);
        const diff = tx.amount - newAmount;
        const oldFee = tx.fee || 0;
        const newFee = tx.fee ? Math.round(tx.fee / 10) : undefined;
        const feeDiff = oldFee - (newFee || 0);

        if (tx.type === 'expense') {
          const currentDelta = accountDeltas.get(tx.accountId) || 0;
          accountDeltas.set(tx.accountId, currentDelta + diff + feeDiff);
        } else if (tx.type === 'income') {
          const currentDelta = accountDeltas.get(tx.accountId) || 0;
          accountDeltas.set(tx.accountId, currentDelta - diff);
        } else if (tx.type === 'transfer') {
          const fromDelta = accountDeltas.get(tx.accountId) || 0;
          accountDeltas.set(tx.accountId, fromDelta + diff + feeDiff);
          if (tx.toAccountId) {
            const toDelta = accountDeltas.get(tx.toAccountId) || 0;
            accountDeltas.set(tx.toAccountId, toDelta - diff);
          }
        }

        if (tx.debtId) {
          const currentDebtDiff = debtDeltas.get(tx.debtId) || 0;
          debtDeltas.set(tx.debtId, currentDebtDiff + diff);
        }

        return { ...tx, amount: newAmount, fee: newFee };
      }
      return tx;
    });

    if (fixedCount > 0) {
      setTransactions(updatedTransactions);

      if (accountDeltas.size > 0) {
        setAccounts(prev =>
          prev.map(acc => {
            const delta = accountDeltas.get(acc.id);
            return delta ? { ...acc, balance: acc.balance + delta } : acc;
          })
        );
      }

      if (debtDeltas.size > 0) {
        setDebts(prev =>
          prev.map(d => {
            const dDiff = debtDeltas.get(d.id);
            if (dDiff) {
              const newPaid = Math.max(0, d.paidAmount - dDiff);
              return {
                ...d,
                paidAmount: newPaid,
                isSettled: newPaid >= d.amount,
              };
            }
            return d;
          })
        );
      }
    }

    return fixedCount;
  };

  const convertAllDataCurrency = (factor: 0.1 | 10) => {
    setAccounts(prev => prev.map(a => ({ ...a, balance: Math.round(a.balance * factor) })));
    setTransactions(prev =>
      prev.map(t => ({
        ...t,
        amount: Math.round(t.amount * factor),
        fee: t.fee ? Math.round(t.fee * factor) : undefined,
      }))
    );
    setBudgets(prev => prev.map(b => ({ ...b, amount: Math.round(b.amount * factor) })));
    setGoals(prev =>
      prev.map(g => ({
        ...g,
        targetAmount: Math.round(g.targetAmount * factor),
        currentAmount: Math.round(g.currentAmount * factor),
      }))
    );
    setDebts(prev =>
      prev.map(d => ({
        ...d,
        amount: Math.round(d.amount * factor),
        paidAmount: Math.round(d.paidAmount * factor),
        payments: d.payments?.map(p => ({ ...p, amount: Math.round(p.amount * factor) })),
      }))
    );
    setCheques(prev => prev.map(c => ({ ...c, amount: Math.round(c.amount * factor) })));
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

  const updateCategory = (cat: Category) => {
    setCategories(prev => prev.map(c => (c.id === cat.id ? cat : c)));
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
    const goal = goals.find(g => g.id === id);
    setGoals(prev =>
      prev.map(g => (g.id === id ? { ...g, currentAmount: g.currentAmount + amount } : g))
    );
    if (accountId) {
      setAccounts(prev =>
        prev.map(a => (a.id === accountId ? { ...a, balance: a.balance - amount } : a))
      );
      const txId = 'tx-' + Date.now();
      const newTx: Transaction = {
        id: txId,
        type: 'expense',
        amount,
        date: getTodayJalali(),
        description: `واریز به هدف پس‌انداز: ${goal?.title || 'هدف'}`,
        categoryId: 'cat-invest',
        accountId,
        tags: ['هدف پس‌انداز', goal?.title || ''],
      };
      setTransactions(prev => [newTx, ...prev]);
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

  const payDebtWithAccount = (params: {
    debtId: string;
    amount: number;
    accountId: string;
    date?: string;
    description?: string;
  }) => {
    const debt = debts.find(d => d.id === params.debtId);
    if (!debt) return;

    const txDate = params.date || getTodayJalali();
    const isDebtPay = debt.type === 'debt';
    const txType: TransactionType = isDebtPay ? 'expense' : 'income';
    const txDesc =
      params.description ||
      (isDebtPay
        ? `پرداخت بدهی / قسط به ${debt.personName}`
        : `دریافت طلب از ${debt.personName}`);

    // 1. Create transaction
    const txId = 'tx-' + Date.now();
    const newTx: Transaction = {
      id: txId,
      type: txType,
      amount: params.amount,
      date: txDate,
      description: txDesc,
      categoryId: isDebtPay ? 'cat-debt-pay' : 'cat-debt-collect',
      accountId: params.accountId,
      debtId: debt.id,
      personId: debt.personId,
      tags: [isDebtPay ? 'تسویه بدهی' : 'وصول طلب', debt.personName],
    };

    setTransactions(prev => [newTx, ...prev]);

    // 2. Adjust account balance
    setAccounts(prev =>
      prev.map(acc => {
        if (acc.id === params.accountId) {
          return {
            ...acc,
            balance: isDebtPay ? acc.balance - params.amount : acc.balance + params.amount,
          };
        }
        return acc;
      })
    );

    // 3. Update debt and payment history
    const accName = accounts.find(a => a.id === params.accountId)?.name;
    setDebts(prev =>
      prev.map(d => {
        if (d.id === params.debtId) {
          const paidAmount = d.paidAmount + params.amount;
          const newPayment: DebtPayment = {
            id: 'dp-' + Date.now(),
            amount: params.amount,
            date: txDate,
            accountId: params.accountId,
            accountName: accName,
            description: txDesc,
          };
          return {
            ...d,
            paidAmount,
            isSettled: paidAmount >= d.amount,
            payments: [...(d.payments || []), newPayment],
          };
        }
        return d;
      })
    );
  };

  // Persons / Contacts CRUD
  const addPerson = (p: Omit<Person, 'id' | 'createdAt'>): Person => {
    const newP: Person = {
      ...p,
      id: 'per-' + Date.now(),
      createdAt: getTodayJalali(),
    };
    setPersons(prev => [newP, ...prev]);
    return newP;
  };

  const updatePerson = (p: Person) => {
    setPersons(prev => prev.map(item => (item.id === p.id ? p : item)));
  };

  const deletePerson = (id: string) => {
    setPersons(prev => prev.filter(p => p.id !== id));
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
  const loadDemoData = useCallback(() => {
    const demo = getDemoData();
    setAccounts(demo.accounts);
    setTransactions(demo.transactions);
    setBudgets(demo.budgets);
    setGoals(demo.goals);
    setDebts(demo.debts);
    setCheques(demo.cheques);
    setPersons(DEFAULT_PERSONS);
  }, []);

  const exportDataJSON = useCallback((): string => {
    const data = {
      version: 6,
      exportDate: new Date().toISOString(),
      accounts,
      transactions,
      categories,
      budgets,
      goals,
      debts,
      cheques,
      persons,
      currency,
      themeConfig,
      dashboardConfig,
    };
    return JSON.stringify(data, null, 2);
  }, [accounts, transactions, categories, budgets, goals, debts, cheques, persons, currency, themeConfig, dashboardConfig]);

  const importDataJSON = useCallback((jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (data.accounts) setAccounts(data.accounts);
      if (data.transactions) setTransactions(data.transactions);
      if (data.categories) setCategories(data.categories);
      if (data.budgets) setBudgets(data.budgets);
      if (data.goals) setGoals(data.goals);
      if (data.debts) setDebts(data.debts);
      if (data.cheques) setCheques(data.cheques);
      if (data.persons) setPersons(data.persons);
      if (data.currency) setCurrency(data.currency);
      if (data.themeConfig) setThemeConfig(data.themeConfig);
      if (data.dashboardConfig) setDashboardConfig(data.dashboardConfig);
      return true;
    } catch (e) {
      console.error('Error importing backup:', e);
      return false;
    }
  }, []);

  const clearAllData = useCallback(() => {
    setTransactions([]);
    setBudgets([]);
    setGoals([]);
    setDebts([]);
    setCheques([]);
    setPersons([]);
    setAccounts(DEFAULT_ACCOUNTS.map(a => ({ ...a, balance: 0 })));
  }, []);

  // Memoized Computations for high performance
  const totalBalance = useMemo(() => {
    return accounts.reduce((sum, a) => sum + a.balance, 0);
  }, [accounts]);

  const totalIncome = useMemo(() => {
    return transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const totalExpense = useMemo(() => {
    return transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const contextValue = useMemo(() => ({
    accounts,
    transactions,
    categories,
    budgets,
    goals,
    debts,
    cheques,
    persons,
    currency,
    darkMode,
    themeConfig,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    divideTransactionBy10,
    multiplyTransactionBy10,
    batchFixRialTransactions,
    convertAllDataCurrency,
    addAccount,
    updateAccount,
    deleteAccount,
    addCategory,
    updateCategory,
    deleteCategory,
    addPerson,
    updatePerson,
    deletePerson,
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
    payDebtWithAccount,
    addCheque,
    updateCheque,
    deleteCheque,
    changeChequeStatus,
    setCurrency,
    toggleDarkMode,
    updateThemeConfig,
    dashboardConfig,
    updateDashboardConfig,
    loadDemoData,
    exportDataJSON,
    importDataJSON,
    clearAllData,
    totalBalance,
    totalIncome,
    totalExpense,
  }), [
    accounts,
    transactions,
    categories,
    budgets,
    goals,
    debts,
    cheques,
    persons,
    currency,
    darkMode,
    themeConfig,
    dashboardConfig,
    totalBalance,
    totalIncome,
    totalExpense,
  ]);

  return (
    <FinanceContext.Provider value={contextValue}>
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

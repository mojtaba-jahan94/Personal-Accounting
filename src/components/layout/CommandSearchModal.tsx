import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Receipt, CreditCard, Layers, ArrowRight, CornerDownLeft } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency, toPersianDigits } from '../../utils/formatters';
import { TabType } from './Sidebar';

export interface CommandSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: TabType) => void;
}

export const CommandSearchModal: React.FC<CommandSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectTab,
}) => {
  const { transactions, accounts, categories, currency } = useFinance();
  const [query, setQuery] = useState('');

  // Keyboard shortcut Ctrl/Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
    }
  }, [isOpen]);

  const cleanQuery = query.trim().toLowerCase();

  const filteredTransactions = useMemo(() => {
    if (!cleanQuery) return transactions.slice(0, 5);
    return transactions
      .filter((t) => {
        const cat = categories.find((c) => c.id === t.categoryId);
        return (
          t.description?.toLowerCase().includes(cleanQuery) ||
          cat?.name?.toLowerCase().includes(cleanQuery) ||
          t.amount.toString().includes(cleanQuery)
        );
      })
      .slice(0, 8);
  }, [transactions, categories, cleanQuery]);

  const filteredAccounts = useMemo(() => {
    if (!cleanQuery) return accounts.slice(0, 4);
    return accounts
      .filter(
        (a) =>
          a.name.toLowerCase().includes(cleanQuery) ||
          a.bankName?.toLowerCase().includes(cleanQuery)
      )
      .slice(0, 4);
  }, [accounts, cleanQuery]);

  const filteredCategories = useMemo(() => {
    if (!cleanQuery) return [];
    return categories
      .filter((c) => c.name.toLowerCase().includes(cleanQuery))
      .slice(0, 4);
  }, [categories, cleanQuery]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:pt-20">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Search Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -10 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-xl rounded-3xl bg-[#120F1A] border border-white/10 text-fintech-text-main shadow-2xl overflow-hidden z-10 backdrop-blur-2xl"
        >
          {/* Search Input Bar */}
          <div className="p-4 border-b border-white/[0.08] flex items-center gap-3">
            <Search className="w-5 h-5 text-violet-400 shrink-0" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="جستجو در تراکنش‌ها، کارت‌ها و دسته‌بندی‌ها..."
              className="flex-1 bg-transparent text-sm text-fintech-text-main placeholder-fintech-text-muted outline-none"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="p-1 rounded-lg text-fintech-text-muted hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <kbd className="hidden sm:inline-flex items-center gap-0.5 text-[10px] font-mono px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-fintech-text-muted">
              ESC
            </kbd>
          </div>

          {/* Results List */}
          <div className="max-h-[60vh] overflow-y-auto p-3 space-y-4 text-xs">
            {/* Accounts */}
            {filteredAccounts.length > 0 && (
              <div>
                <span className="text-[10px] font-mono tracking-wider text-fintech-text-sub uppercase px-2 mb-1 block">
                  حساب‌ها و کارت‌ها
                </span>
                <div className="space-y-1">
                  {filteredAccounts.map((acc) => (
                    <div
                      key={acc.id}
                      onClick={() => {
                        onSelectTab('accounts');
                        onClose();
                      }}
                      className="p-2.5 rounded-2xl hover:bg-white/[0.05] border border-transparent hover:border-white/10 flex items-center justify-between cursor-pointer transition"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-violet-500/15 border border-violet-500/30 text-violet-400 flex items-center justify-center">
                          <CreditCard className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-semibold text-fintech-text-main block">
                            {acc.name}
                          </span>
                          <span className="text-[10px] text-fintech-text-muted font-mono">
                            {acc.bankName || 'حساب نقدی'}
                          </span>
                        </div>
                      </div>
                      <span className="font-mono tabular-nums text-violet-400 font-semibold">
                        {formatCurrency(acc.balance, currency)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Transactions */}
            {filteredTransactions.length > 0 && (
              <div>
                <span className="text-[10px] font-mono tracking-wider text-fintech-text-sub uppercase px-2 mb-1 block">
                  تراکنش‌ها
                </span>
                <div className="space-y-1">
                  {filteredTransactions.map((tx) => (
                    <div
                      key={tx.id}
                      onClick={() => {
                        onSelectTab('transactions');
                        onClose();
                      }}
                      className="p-2.5 rounded-2xl hover:bg-white/[0.05] border border-transparent hover:border-white/10 flex items-center justify-between cursor-pointer transition"
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                            tx.type === 'income'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : tx.type === 'expense'
                              ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                              : 'bg-violet-500/15 text-violet-400 border border-violet-500/30'
                          }`}
                        >
                          <Receipt className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-semibold text-fintech-text-main block">
                            {tx.description}
                          </span>
                          <span className="text-[10px] text-fintech-text-muted font-mono">
                            {tx.date}
                          </span>
                        </div>
                      </div>
                      <span
                        className={`font-mono tabular-nums font-semibold ${
                          tx.type === 'income'
                            ? 'text-emerald-400'
                            : tx.type === 'expense'
                            ? 'text-rose-400'
                            : 'text-violet-400'
                        }`}
                      >
                        {tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : ''}
                        {formatCurrency(tx.amount, currency)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty Result */}
            {filteredAccounts.length === 0 && filteredTransactions.length === 0 && (
              <div className="py-8 text-center text-fintech-text-muted">
                نتیجه‌ای برای &ldquo;{query}&rdquo; یافت نشد.
              </div>
            )}
          </div>

          {/* Quick Footer Navigation */}
          <div className="p-3 border-t border-white/[0.08] bg-black/20 flex items-center justify-between text-[11px] text-fintech-text-muted">
            <span>میانبر: از کلیدهای جهت‌نما یا کلیک برای انتخاب استفاده کنید</span>
            <div className="flex items-center gap-1 font-mono">
              <span>انتخاب</span>
              <CornerDownLeft className="w-3 h-3" />
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CommandSearchModal;

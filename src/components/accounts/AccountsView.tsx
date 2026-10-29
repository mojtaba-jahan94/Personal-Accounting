import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFinance } from '../../context/FinanceContext';
import { Account, AccountType, Transaction } from '../../types';
import { formatCurrency, formatCardNumber, toPersianDigits } from '../../utils/formatters';
import { getTodayJalali } from '../../utils/jalali';
import { getCategoryIcon } from '../../utils/categoryIcons';
import { AccountModal } from './AccountModal';
import { TransferModal } from './TransferModal';
import { TransactionModal } from '../transactions/TransactionModal';
import { TabType } from '../layout/Sidebar';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { IconButton } from '../ui/IconButton';
import { Badge } from '../ui/Badge';
import { EmptyState } from '../ui/EmptyState';
import { AnimatedNumber } from '../ui/AnimatedNumber';
import {
  CreditCard,
  Wallet,
  PiggyBank,
  Plus,
  ArrowLeftRight,
  Copy,
  Check,
  Layers,
  ArrowUpRight,
  ArrowDownLeft,
  ChevronLeft,
  Sparkles,
  SlidersHorizontal,
} from 'lucide-react';

interface AccountsViewProps {
  onSelectTab?: (tab: TabType) => void;
}

export const AccountsView: React.FC<AccountsViewProps> = ({ onSelectTab }) => {
  const { accounts, totalBalance, currency, deleteAccount, transactions, categories } =
    useFinance();

  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [transferFromId, setTransferFromId] = useState<string | undefined>(undefined);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Stacked Wallet State
  const [isStackExpanded, setIsStackExpanded] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(
    accounts[0]?.id || null
  );

  // Quick Transaction Modal State
  const [transactionModalOpen, setTransactionModalOpen] = useState(false);
  const [quickTransaction, setQuickTransaction] = useState<Transaction | null>(null);

  // Ensure selectedAccountId stays valid if accounts change
  const activeSelectedId =
    selectedAccountId && accounts.some((a) => a.id === selectedAccountId)
      ? selectedAccountId
      : accounts[0]?.id || null;

  const selectedCard = useMemo(
    () => accounts.find((a) => a.id === activeSelectedId) || accounts[0] || null,
    [accounts, activeSelectedId]
  );

  // Transactions filtered by selected account
  const cardTransactions = useMemo(() => {
    if (!selectedCard) return [];
    return transactions
      .filter(
        (t) => t.accountId === selectedCard.id || t.toAccountId === selectedCard.id
      )
      .slice(0, 6);
  }, [transactions, selectedCard]);

  const handleCopy = (text: string, id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (accounts.length <= 1) {
      alert('حداقل یک حساب باید در سیستم باقی بماند.');
      return;
    }
    if (
      window.confirm(
        'آیا از حذف این حساب اطمینان دارید؟ موجودی و تراکنش‌های متصل به آن باقی خواهند ماند.'
      )
    ) {
      deleteAccount(id);
      setSelectedAccountId((prev) => (prev === id ? null : prev));
    }
  };

  const getAccountTypeLabel = (type: AccountType) => {
    switch (type) {
      case 'bank':
        return 'کارت بانکی';
      case 'cash':
        return 'کیف‌پول نقدی';
      case 'savings':
        return 'پس‌انداز و سرمایه';
      default:
        return 'حساب مالی';
    }
  };

  const getCardStyle = (index: number, isDefault?: boolean) => {
    if (isDefault || index === 0) {
      return {
        badge: 'کارت اصلی',
        gradient: 'from-[#1e1b4b] via-[#2e1065] to-[#0f172a]',
        border: 'border-violet-500/40',
        glow: 'shadow-[0_20px_40px_rgba(139,92,246,0.18)]',
        accent: 'text-violet-300',
      };
    }
    if (index % 3 === 1) {
      return {
        badge: 'کارت دوم',
        gradient: 'from-[#0f172a] via-[#1e293b] to-[#090d16]',
        border: 'border-cyan-500/30',
        glow: 'shadow-[0_20px_40px_rgba(6,182,212,0.12)]',
        accent: 'text-cyan-300',
      };
    }
    return {
      badge: 'کارت فرعی',
      gradient: 'from-[#18181b] via-[#27272a] to-[#09090b]',
      border: 'border-emerald-500/30',
      glow: 'shadow-[0_20px_40px_rgba(16,185,129,0.12)]',
      accent: 'text-emerald-300',
    };
  };

  // Quick Action Handlers
  const handleQuickExpense = () => {
    if (!selectedCard) return;
    const defaultExpCat = categories.find((c) => c.type === 'expense');
    setQuickTransaction({
      id: '',
      type: 'expense',
      amount: 0,
      date: getTodayJalali(),
      description: '',
      categoryId: defaultExpCat ? defaultExpCat.id : '',
      accountId: selectedCard.id,
    });
    setTransactionModalOpen(true);
  };

  const handleQuickIncome = () => {
    if (!selectedCard) return;
    const defaultIncCat = categories.find((c) => c.type === 'income');
    setQuickTransaction({
      id: '',
      type: 'income',
      amount: 0,
      date: getTodayJalali(),
      description: '',
      categoryId: defaultIncCat ? defaultIncCat.id : '',
      accountId: selectedCard.id,
    });
    setTransactionModalOpen(true);
  };

  const handleQuickTransfer = () => {
    if (!selectedCard) return;
    setTransferFromId(selectedCard.id);
    setIsTransferModalOpen(true);
  };

  const handleQuickEdit = () => {
    if (!selectedCard) return;
    setEditingAccount(selectedCard);
    setIsAccountModalOpen(true);
  };

  // Grouped totals for header breakdown
  const bankAccounts = accounts.filter((a) => a.type === 'bank');
  const cashAccounts = accounts.filter((a) => a.type === 'cash');
  const savingsAccounts = accounts.filter((a) => a.type === 'savings');

  const bankTotal = bankAccounts.reduce((sum, a) => sum + a.balance, 0);
  const cashTotal = cashAccounts.reduce((sum, a) => sum + a.balance, 0);
  const savingsTotal = savingsAccounts.reduce((sum, a) => sum + a.balance, 0);

  return (
    <div className="space-y-8 pb-20 select-none">
      {/* 1. Header & Overall Liquidity Banner */}
      <Card variant="gradient" className="p-6 sm:p-8 relative overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-violet-600/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-indigo-600/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] tracking-wider text-violet-400 uppercase font-mono font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
                <span>LIQUIDITY & WALLET</span>
              </span>
              <span className="text-fintech-text-muted text-[10px]">•</span>
              <span className="text-xs text-fintech-text-muted font-mono">
                {toPersianDigits(accounts.length)} حساب و کارت فعال
              </span>
            </div>
            <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white font-mono">
              <AnimatedNumber value={totalBalance} currency={currency} />
            </div>
            <p className="text-xs text-fintech-text-muted mt-2">
              مجموع کل نقدینگی فعال در کارت‌های بانکی، کیف‌پول‌های نقدی و صندوق‌های پس‌انداز
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 flex-wrap">
            <Button
              variant="secondary"
              onClick={() => {
                setTransferFromId(undefined);
                setIsTransferModalOpen(true);
              }}
              icon={<ArrowLeftRight className="w-4 h-4 text-violet-400" />}
            >
              انتقال بین‌حساب‌ها
            </Button>

            <Button
              variant="primary"
              onClick={() => {
                setEditingAccount(null);
                setIsAccountModalOpen(true);
              }}
              icon={<Plus className="w-4 h-4 stroke-[2.5]" />}
            >
              افزودن حساب جدید
            </Button>
          </div>
        </div>

        {/* Breakdown by Account Type */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-white/10 relative z-10">
          <div className="p-3.5 rounded-2xl bg-black/20 dark:bg-white/[0.03] border border-white/5 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-fintech-text-muted block font-mono">
                کارت‌های بانکی ({toPersianDigits(bankAccounts.length)})
              </span>
              <span className="font-bold font-mono text-sm sm:text-base text-white">
                <AnimatedNumber value={bankTotal} currency={currency} />
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-violet-500/15 text-violet-400">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-black/20 dark:bg-white/[0.03] border border-white/5 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-fintech-text-muted block font-mono">
                کیف‌پول نقدی ({toPersianDigits(cashAccounts.length)})
              </span>
              <span className="font-bold font-mono text-sm sm:text-base text-white">
                <AnimatedNumber value={cashTotal} currency={currency} />
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-400">
              <Wallet className="w-4 h-4" />
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-black/20 dark:bg-white/[0.03] border border-white/5 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-fintech-text-muted block font-mono">
                پس‌انداز و ذخایر ({toPersianDigits(savingsAccounts.length)})
              </span>
              <span className="font-bold font-mono text-sm sm:text-base text-white">
                <AnimatedNumber value={savingsTotal} currency={currency} />
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-indigo-500/15 text-indigo-400">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
        </div>
      </Card>

      {/* 2. Interactive Stacked Wallet Container */}
      <div className="space-y-6">
        {/* Wallet Header & View Toggle */}
        <div className="flex items-center justify-between px-1">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-fintech-text-primary tracking-tight">
              کیف کارت‌ها و حساب‌ها
            </h2>
            <p className="text-xs text-fintech-text-muted mt-0.5">
              برای مشاهده موجودی و ثبت تراکنش، روی هر کارت کلیک کنید
            </p>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsStackExpanded((prev) => !prev)}
            icon={<Layers className="w-3.5 h-3.5 text-violet-400" />}
          >
            {isStackExpanded ? 'نمایش پشته کارت‌ها' : 'مشاهده همه کارت‌ها'}
          </Button>
        </div>

        {/* Cards Render Area */}
        {accounts.length === 0 ? (
          <Card variant="glass" className="py-12">
            <EmptyState
              icon={CreditCard}
              title="هنوز حسابی تعریف نشده است"
              description="برای شروع ثبت تراکنش‌ها، کارت بانکی یا کیف‌پول نقدی خود را اضافه کنید."
              actionLabel="افزودن اولین کارت"
              onAction={() => setIsAccountModalOpen(true)}
            />
          </Card>
        ) : isStackExpanded ? (
          /* ================= EXPANDED GRID VIEW ================= */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {accounts.map((acc, index) => {
              const style = getCardStyle(index, acc.isDefault);
              const isSelected = acc.id === activeSelectedId;

              return (
                <div
                  key={acc.id}
                  onClick={() => setSelectedAccountId(acc.id)}
                  className={`bg-gradient-to-br ${style.gradient} ${style.border} ${style.glow} border rounded-3xl p-6 min-h-[220px] flex flex-col justify-between cursor-pointer transition-[transform,box-shadow] duration-200 hover:-translate-y-1.5 relative overflow-hidden ${
                    isSelected ? 'ring-2 ring-violet-400 shadow-[0_20px_45px_rgba(139,92,246,0.25)]' : ''
                  }`}
                >
                  <div className="flex items-start justify-between relative z-10">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">
                          {acc.bankName || acc.name}
                        </span>
                        <span className="text-[10px] font-mono tracking-wider px-2 py-0.5 rounded-full bg-black/40 text-violet-300 border border-violet-500/20 font-semibold">
                          {style.badge}
                        </span>
                      </div>
                      <span className="text-[11px] text-white/60 block mt-1 font-mono">
                        {getAccountTypeLabel(acc.type)}
                      </span>
                    </div>

                    {/* Chip & Contactless */}
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-6 rounded bg-gradient-to-tr from-amber-300 via-amber-100 to-amber-400 shadow-xs border border-black/30" />
                      <span className="text-xs text-white/50 font-mono">)))</span>
                    </div>
                  </div>

                  {/* 16-Digit Card Number */}
                  <div className="my-4 relative z-10">
                    <div className="font-mono text-base tracking-[0.2em] dir-ltr text-center text-white font-bold p-2.5 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center gap-2">
                      <span>{formatCardNumber(acc.cardNumber || '••••••••••••••••')}</span>
                      {acc.cardNumber && (
                        <button
                          onClick={(e) => handleCopy(acc.cardNumber || '', acc.id + '-card', e)}
                          className="p-1 rounded-md text-white/60 hover:text-white transition"
                          title="کپی شماره کارت"
                        >
                          {copiedId === acc.id + '-card' ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Card Bottom Row */}
                  <div className="flex items-center justify-between text-[11px] font-mono text-white/60 uppercase tracking-wider relative z-10 border-t border-white/10 pt-3">
                    <span className="truncate max-w-[120px] text-white font-sans">{acc.name}</span>
                    <span className="text-xs font-bold font-mono text-white">
                      {formatCurrency(acc.balance, currency)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ================= 3D INTERACTIVE OVERLAPPING STACK ================= */
          <div className="max-w-xl mx-auto w-full relative pt-2 pb-6">
            <div className="relative flex flex-col items-center">
              {accounts.map((acc, index) => {
                const style = getCardStyle(index, acc.isDefault);
                const isSelected = acc.id === activeSelectedId;
                const zIndex = isSelected ? 30 : 20 - index;
                const topOverlapClass = index === 0 ? 'mt-0' : '-mt-32 sm:-mt-36';

                return (
                  <motion.div
                    key={acc.id}
                    onClick={() => setSelectedAccountId(acc.id)}
                    style={{ zIndex }}
                    layout
                    transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                    className={`w-full ${topOverlapClass} bg-gradient-to-br ${style.gradient} ${style.border} rounded-3xl p-6 sm:p-7 min-h-[220px] sm:min-h-[240px] flex flex-col justify-between cursor-pointer border relative overflow-hidden transition-[transform,opacity,box-shadow] duration-200 ${
                      isSelected
                        ? 'scale-100 shadow-[0_30px_60px_rgba(0,0,0,0.9)] ring-2 ring-violet-400/80'
                        : 'scale-[0.97] opacity-85 hover:opacity-100 hover:-translate-y-4 hover:scale-[0.985] shadow-[0_16px_36px_rgba(0,0,0,0.7)]'
                    }`}
                  >
                    {/* Card Top Row */}
                    <div className="flex items-start justify-between relative z-10">
                      <div>
                        <div className="flex items-center gap-2.5">
                          <span className="text-base sm:text-lg font-bold text-white tracking-wide">
                            {acc.bankName || acc.name}
                          </span>
                          <span className="text-[10px] font-mono tracking-wider px-2.5 py-0.5 rounded-full bg-black/40 text-violet-300 border border-violet-500/20 font-semibold">
                            {style.badge}
                          </span>
                        </div>
                        <span className="text-[11px] text-white/60 block mt-1 font-mono">
                          {getAccountTypeLabel(acc.type)}
                        </span>
                      </div>

                      {/* Chip & Contactless */}
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-7 rounded bg-gradient-to-tr from-amber-300 via-amber-100 to-amber-400 shadow-sm border border-black/30" />
                        <span className="text-sm text-white/50 font-mono font-bold">)))</span>
                      </div>
                    </div>

                    {/* Card Middle: 16-Digit Card Number with Copy */}
                    <div className="my-3 sm:my-4 relative z-10">
                      <div className="font-mono text-base sm:text-lg tracking-[0.22em] dir-ltr text-center text-white font-bold p-2.5 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between px-4">
                        <span>{formatCardNumber(acc.cardNumber || '•••• •••• •••• ••••')}</span>
                        {acc.cardNumber && (
                          <button
                            type="button"
                            onClick={(e) => handleCopy(acc.cardNumber || '', acc.id + '-card', e)}
                            className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition"
                            title="کپی شماره کارت"
                          >
                            {copiedId === acc.id + '-card' ? (
                              <Check className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Card Bottom Row: Cardholder Name & Sheba / Status */}
                    <div className="flex items-center justify-between text-[11px] font-mono text-white/60 uppercase tracking-wider relative z-10 border-t border-white/10 pt-3">
                      <div>
                        <span className="text-[10px] text-white/50 block">دارنده حساب:</span>
                        <span className="text-xs font-bold text-white truncate block max-w-[160px] font-sans">
                          {acc.name}
                        </span>
                      </div>

                      {acc.shaba ? (
                        <div className="text-left dir-ltr">
                          <span className="text-[10px] text-white/50 block">شماره شبا:</span>
                          <span className="text-xs font-bold text-violet-300 font-mono flex items-center gap-1">
                            <span>IR{acc.shaba.slice(-8)}</span>
                            <button
                              type="button"
                              onClick={(e) => handleCopy(`IR${acc.shaba}`, acc.id + '-shaba', e)}
                              className="text-white/60 hover:text-white"
                              title="کپی شماره شبا"
                            >
                              {copiedId === acc.id + '-shaba' ? (
                                <Check className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs font-mono font-bold text-violet-300">
                          {formatCurrency(acc.balance, currency)}
                        </span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. Selected Card Hero Balance & Quick Actions */}
        {selectedCard && (
          <div className="max-w-xl mx-auto w-full space-y-6 pt-2">
            <Card variant="elevated" className="p-6 sm:p-7 space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] tracking-wider text-fintech-text-muted uppercase font-mono">
                  {selectedCard.bankName || 'کارت فعال'} •{' '}
                  {selectedCard.cardNumber ? `پایان به ${selectedCard.cardNumber.slice(-4)}` : selectedCard.name}
                </span>
                <Badge variant="primary" size="sm">
                  {getAccountTypeLabel(selectedCard.type)}
                </Badge>
              </div>

              {/* Hero Balance */}
              <div className="flex items-baseline justify-between gap-4 flex-wrap">
                <div>
                  <span className="text-xs text-fintech-text-muted block font-mono mb-1">موجودی فعلی حساب:</span>
                  <div className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white font-mono">
                    <AnimatedNumber value={selectedCard.balance} currency={currency} />
                  </div>
                </div>

                {typeof selectedCard.initialBalance === 'number' &&
                  selectedCard.initialBalance !== selectedCard.balance && (
                    <div className="text-left text-xs font-mono text-fintech-text-muted">
                      <span className="block text-[10px]">مانده اولیه:</span>
                      <span className="text-white/70">
                        {formatCurrency(selectedCard.initialBalance, currency)}
                      </span>
                    </div>
                  )}
              </div>

              {/* 4 Circular Quick-Action Buttons */}
              <div className="pt-4 border-t border-white/10">
                <div className="grid grid-cols-4 gap-2 sm:gap-4 place-items-center">
                  <div className="flex flex-col items-center">
                    <button
                      type="button"
                      onClick={handleQuickExpense}
                      className="w-14 h-14 rounded-2xl border border-rose-500/20 bg-rose-500/10 hover:bg-rose-500/20 active:scale-95 transition-[transform,background-color] duration-150 flex items-center justify-center text-rose-400 shadow-md group"
                      title="ثبت هزینه از این کارت"
                    >
                      <ArrowUpRight className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    </button>
                    <span className="text-[11px] text-fintech-text-muted mt-2">ثبت هزینه</span>
                  </div>

                  <div className="flex flex-col items-center">
                    <button
                      type="button"
                      onClick={handleQuickIncome}
                      className="w-14 h-14 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 hover:bg-emerald-500/20 active:scale-95 transition-[transform,background-color] duration-150 flex items-center justify-center text-emerald-400 shadow-md group"
                      title="افزایش موجودی و واریز"
                    >
                      <ArrowDownLeft className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    </button>
                    <span className="text-[11px] text-fintech-text-muted mt-2">واریز وجه</span>
                  </div>

                  <div className="flex flex-col items-center">
                    <button
                      type="button"
                      onClick={handleQuickTransfer}
                      className="w-14 h-14 rounded-2xl border border-violet-500/20 bg-violet-500/10 hover:bg-violet-500/20 active:scale-95 transition-[transform,background-color] duration-150 flex items-center justify-center text-violet-400 shadow-md group"
                      title="انتقال به کارت دیگر"
                    >
                      <ArrowLeftRight className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    </button>
                    <span className="text-[11px] text-fintech-text-muted mt-2">انتقال</span>
                  </div>

                  <div className="flex flex-col items-center">
                    <button
                      type="button"
                      onClick={handleQuickEdit}
                      className="w-14 h-14 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 active:scale-95 transition-[transform,background-color] duration-150 flex items-center justify-center text-fintech-text-primary shadow-md group"
                      title="ویرایش یا حذف حساب"
                    >
                      <SlidersHorizontal className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    </button>
                    <span className="text-[11px] text-fintech-text-muted mt-2">مدیریت</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* 4. Recent Transactions for Selected Card */}
            <Card variant="glass" className="p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-violet-400" />
                  <h3 className="text-xs font-bold font-mono tracking-wider text-white uppercase">
                    تراکنش‌های اخیر این کارت
                  </h3>
                </div>

                {onSelectTab && (
                  <button
                    type="button"
                    onClick={() => onSelectTab('transactions')}
                    className="flex items-center gap-1 text-[11px] text-violet-400 hover:text-violet-300 transition"
                  >
                    <span>مشاهده همه</span>
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {cardTransactions.length === 0 ? (
                <div className="py-6 text-center text-xs text-fintech-text-muted font-sans">
                  هیچ تراکنشی اخیراً برای این کارت ثبت نشده است.
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {cardTransactions.map((tx) => {
                    const cat = categories.find((c) => c.id === tx.categoryId);
                    const isExpense = tx.type === 'expense';
                    const isIncome = tx.type === 'income';

                    return (
                      <div
                        key={tx.id}
                        className="py-3 flex items-center justify-between gap-3 group transition"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-violet-400 shrink-0">
                            {cat ? getCategoryIcon(cat.icon, 'w-4 h-4') : <Sparkles className="w-4 h-4" />}
                          </div>
                          <div className="min-w-0">
                            <span className="text-sm font-semibold text-white truncate block">
                              {tx.description || cat?.name || 'تراکنش'}
                            </span>
                            <span className="text-[11px] text-fintech-text-muted font-mono block mt-0.5">
                              {tx.date} {tx.time ? `• ${tx.time}` : ''}
                            </span>
                          </div>
                        </div>

                        <div className="text-left font-mono text-sm tabular-nums shrink-0 font-bold">
                          <span
                            className={
                              isExpense
                                ? 'text-rose-400'
                                : isIncome
                                ? 'text-emerald-400'
                                : 'text-violet-400'
                            }
                          >
                            {isExpense ? '- ' : isIncome ? '+ ' : ''}
                            {formatCurrency(tx.amount, currency)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>
        )}
      </div>

      {/* Modals */}
      <AccountModal
        isOpen={isAccountModalOpen}
        onClose={() => {
          setIsAccountModalOpen(false);
          setEditingAccount(null);
        }}
        initialAccount={editingAccount}
      />

      <TransferModal
        isOpen={isTransferModalOpen}
        onClose={() => {
          setIsTransferModalOpen(false);
          setTransferFromId(undefined);
        }}
        initialFromAccountId={transferFromId}
      />

      <TransactionModal
        isOpen={transactionModalOpen}
        onClose={() => {
          setTransactionModalOpen(false);
          setQuickTransaction(null);
        }}
        initialTransaction={quickTransaction}
      />
    </div>
  );
};

export default AccountsView;

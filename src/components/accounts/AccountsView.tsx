import React, { useState, useMemo } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Account, AccountType, Transaction } from '../../types';
import { formatCurrency, formatCardNumber, toPersianDigits } from '../../utils/formatters';
import { getTodayJalali } from '../../utils/jalali';
import { getCategoryIcon } from '../../utils/categoryIcons';
import { AccountModal } from './AccountModal';
import { TransferModal } from './TransferModal';
import { TransactionModal } from '../transactions/TransactionModal';
import { TabType } from '../layout/Sidebar';
import {
  CreditCard,
  Wallet,
  PiggyBank,
  Plus,
  ArrowLeftRight,
  Edit2,
  Trash2,
  Copy,
  Check,
  Building2,
  Layers,
  ArrowUpRight,
  ArrowDownLeft,
  ChevronLeft,
  Sparkles,
  SlidersHorizontal,
  ChevronDown,
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
      if (selectedAccountId === id) {
        const remaining = accounts.filter((a) => a.id !== id);
        setSelectedAccountId(remaining[0]?.id || null);
      }
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

  const getCardTier = (index: number, isDefault?: boolean) => {
    if (isDefault || index === 0) return { label: 'GOLD', badge: '✦ AURUM GOLD', isGold: true };
    if (index === 1) return { label: 'METAL', badge: '✦ AURUM METAL', isGold: false };
    return { label: 'OBSIDIAN', badge: '✦ AURUM OBSIDIAN', isGold: false };
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
    <div className="space-y-8 pb-16 select-none">
      {/* 1. Header & Overall Liquidity Banner */}
      <div className="rounded-3xl p-6 sm:p-8 bg-[#121215]/90 border border-white/[0.08] shadow-[0_24px_50px_rgba(0,0,0,0.85)] relative overflow-hidden backdrop-blur-2xl">
        {/* Subtle Luxury Sheen */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#DFC296]/[0.06] blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-[#A390B8]/[0.04] blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] tracking-[0.22em] text-[#DFC296] uppercase font-mono font-bold flex items-center gap-1.5">
                <span>✦ LIQUIDITY OVERVIEW</span>
              </span>
              <span className="text-[#8E8B82] text-[9px]">•</span>
              <span className="text-xs text-[#8E8B82] font-mono">
                {toPersianDigits(accounts.length)} حساب فعال
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light font-serif tracking-tight text-[#F4F0EA] tabular-nums">
              {formatCurrency(totalBalance, currency)}
            </h2>
            <p className="text-xs text-[#8E8B82] mt-2 font-sans">
              مجموع کل نقدینگی فعال در کارت‌های بانکی، کیف‌پول‌های نقدی و صندوق‌های ذخیره
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => {
                setTransferFromId(undefined);
                setIsTransferModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] text-[#F4F0EA] text-xs font-bold transition border border-white/[0.08] active:scale-95"
            >
              <ArrowLeftRight className="w-4 h-4 text-[#DFC296]" />
              <span>انتقال وجه</span>
            </button>

            <button
              onClick={() => {
                setEditingAccount(null);
                setIsAccountModalOpen(true);
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#DFC296] hover:bg-[#CBB084] text-[#0A0A0C] text-xs font-bold shadow-lg shadow-[#DFC296]/20 transition active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>+ افزودن حساب جدید</span>
            </button>
          </div>
        </div>

        {/* Breakdown by Account Type */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-white/[0.07] relative z-10">
          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between">
            <div>
              <span className="text-[10px] text-[#8E8B82] block font-mono">
                کارت‌های بانکی ({toPersianDigits(bankAccounts.length)})
              </span>
              <span className="font-bold font-mono text-sm sm:text-base text-[#F4F0EA]">
                {formatCurrency(bankTotal, currency)}
              </span>
            </div>
            <div className="p-2 rounded-xl bg-[#DFC296]/10 text-[#DFC296]">
              <CreditCard className="w-4 h-4 stroke-[1.6]" />
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between">
            <div>
              <span className="text-[10px] text-[#8E8B82] block font-mono">
                کیف‌پول نقدی ({toPersianDigits(cashAccounts.length)})
              </span>
              <span className="font-bold font-mono text-sm sm:text-base text-[#F4F0EA]">
                {formatCurrency(cashTotal, currency)}
              </span>
            </div>
            <div className="p-2 rounded-xl bg-[#7A9A95]/15 text-[#7A9A95]">
              <Wallet className="w-4 h-4 stroke-[1.6]" />
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between">
            <div>
              <span className="text-[10px] text-[#8E8B82] block font-mono">
                پس‌انداز و ذخایر ({toPersianDigits(savingsAccounts.length)})
              </span>
              <span className="font-bold font-mono text-sm sm:text-base text-[#F4F0EA]">
                {formatCurrency(savingsTotal, currency)}
              </span>
            </div>
            <div className="p-2 rounded-xl bg-[#A390B8]/15 text-[#A390B8]">
              <PiggyBank className="w-4 h-4 stroke-[1.6]" />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Interactive Stacked Wallet Container */}
      <div className="space-y-6">
        {/* Wallet Header & "ALL CARDS" Toggle */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-3">
            <h2 className="text-xl sm:text-2xl font-light font-serif tracking-tight text-[#F4F0EA]">
              کیف پول{' '}
              <span className="text-[#8E8B82] text-xs font-mono font-normal tracking-widest">
                / WALLET
              </span>
            </h2>
            <span className="text-[11px] font-mono text-[#8E8B82] hidden sm:inline">
              (روی هر کارت کلیک کنید تا متمرکز شود)
            </span>
          </div>

          {/* Toggle Stacked vs Grid View */}
          <button
            type="button"
            onClick={() => setIsStackExpanded((prev) => !prev)}
            className={`text-[10px] tracking-[0.18em] uppercase rounded-full px-4 py-2 border transition-all duration-300 flex items-center gap-2 ${
              isStackExpanded
                ? 'text-[#0A0A0C] bg-[#DFC296] border-[#DFC296] font-bold shadow-md shadow-[#DFC296]/20'
                : 'text-[#8E8B82] hover:text-[#DFC296] border-white/[0.12] bg-[#121215] hover:border-[#DFC296]/40'
            }`}
          >
            <Layers className="w-3.5 h-3.5 stroke-[1.8]" />
            <span>{isStackExpanded ? 'نمایش پشته (STACK)' : 'همه کارت‌ها (ALL CARDS)'}</span>
          </button>
        </div>

        {/* Cards Render Area */}
        {accounts.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-[#121215]/80 border border-white/[0.08] space-y-4">
            <div className="w-16 h-16 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto text-[#DFC296]">
              <CreditCard className="w-8 h-8 stroke-[1.5]" />
            </div>
            <h3 className="text-lg font-serif font-light text-[#F4F0EA]">هنوز حسابی تعریف نشده است</h3>
            <p className="text-xs text-[#8E8B82] max-w-sm mx-auto">
              برای شروع ثبت تراکنش‌ها، کارت بانکی یا کیف‌پول نقدی خود را اضافه کنید.
            </p>
            <button
              onClick={() => setIsAccountModalOpen(true)}
              className="px-5 py-2.5 rounded-full bg-[#DFC296] text-[#0A0A0C] text-xs font-bold shadow-lg"
            >
              افزودن اولین کارت
            </button>
          </div>
        ) : isStackExpanded ? (
          /* ================= EXPANDED GRID VIEW ================= */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {accounts.map((acc, index) => {
              const tier = getCardTier(index, acc.isDefault);
              const isSelected = acc.id === activeSelectedId;
              const cardClass = tier.isGold ? 'aurum-card-gold' : 'aurum-card-obsidian';

              return (
                <div
                  key={acc.id}
                  onClick={() => setSelectedAccountId(acc.id)}
                  className={`${cardClass} aurum-shimmer-effect rounded-3xl p-6 min-h-[220px] flex flex-col justify-between cursor-pointer transition-all duration-300 hover:-translate-y-1.5 ${
                    isSelected ? 'ring-2 ring-[#DFC296] shadow-[0_20px_40px_rgba(223,194,150,0.25)]' : ''
                  }`}
                >
                  {/* Card Top Row */}
                  <div className="flex items-start justify-between relative z-10">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-bold text-[#F4F0EA]">
                          {acc.bankName || acc.name}
                        </span>
                        <span className="text-[9px] font-mono tracking-widest px-2 py-0.5 rounded-full bg-black/40 text-[#DFC296] border border-[#DFC296]/30 font-semibold">
                          {tier.label}
                        </span>
                      </div>
                      <span className="text-[11px] text-[#8E8B82] block mt-1 font-mono">
                        {getAccountTypeLabel(acc.type)}
                      </span>
                    </div>

                    {/* Chip & Contactless */}
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-6 rounded bg-gradient-to-tr from-[#DFC296] via-[#F4F0EA] to-[#CBB084] shadow-xs border border-black/30" />
                      <span className="text-xs text-white/50 font-mono">)))</span>
                    </div>
                  </div>

                  {/* Card Middle: 16-Digit Card Number */}
                  <div className="my-4 relative z-10">
                    <div className="font-mono text-base tracking-[0.2em] dir-ltr text-center text-[#F4F0EA] font-bold p-2 rounded-xl bg-black/30 border border-white/[0.08] flex items-center justify-center gap-2">
                      <span>{formatCardNumber(acc.cardNumber || '••••••••••••••••')}</span>
                      {acc.cardNumber && (
                        <button
                          onClick={(e) => handleCopy(acc.cardNumber || '', acc.id + '-card', e)}
                          className="p-1 rounded-md text-[#8E8B82] hover:text-[#DFC296] transition"
                          title="کپی شماره کارت"
                        >
                          {copiedId === acc.id + '-card' ? (
                            <Check className="w-3.5 h-3.5 text-[#7A9A95]" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Card Bottom Row */}
                  <div className="flex items-center justify-between text-[11px] font-mono text-[#8E8B82] uppercase tracking-wider relative z-10 border-t border-white/[0.08] pt-3">
                    <span className="truncate max-w-[120px] text-[#F4F0EA]">{acc.name}</span>
                    <span className="text-xs font-bold font-mono text-[#DFC296]">
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
                const tier = getCardTier(index, acc.isDefault);
                const isSelected = acc.id === activeSelectedId;
                const cardClass = tier.isGold ? 'aurum-card-gold' : 'aurum-card-obsidian';

                // Determine stack order: selected card has highest z-index
                const zIndex = isSelected ? 30 : 20 - index;
                const topOverlapClass = index === 0 ? 'mt-0' : '-mt-32 sm:-mt-36';

                return (
                  <div
                    key={acc.id}
                    onClick={() => setSelectedAccountId(acc.id)}
                    style={{ zIndex }}
                    className={`w-full ${topOverlapClass} ${cardClass} aurum-shimmer-effect rounded-3xl p-6 sm:p-7 min-h-[220px] sm:min-h-[240px] flex flex-col justify-between cursor-pointer transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                      isSelected
                        ? 'scale-100 shadow-[0_30px_60px_rgba(0,0,0,0.95)] ring-1 ring-[#DFC296]/50'
                        : 'scale-[0.97] opacity-85 hover:opacity-100 hover:-translate-y-4 hover:scale-[0.985] shadow-[0_16px_36px_rgba(0,0,0,0.8)]'
                    }`}
                  >
                    {/* Card Top Row */}
                    <div className="flex items-start justify-between relative z-10">
                      <div>
                        <div className="flex items-center gap-2.5">
                          <span className="text-base sm:text-lg font-bold text-[#F4F0EA] tracking-wide">
                            {acc.bankName || acc.name}
                          </span>
                          <span className="text-[10px] font-mono tracking-widest px-2.5 py-0.5 rounded-full bg-black/40 text-[#DFC296] border border-[#DFC296]/30 font-semibold uppercase">
                            {tier.badge}
                          </span>
                        </div>
                        <span className="text-[11px] text-[#8E8B82] block mt-1 font-mono">
                          {getAccountTypeLabel(acc.type)}
                        </span>
                      </div>

                      {/* EMV Chip & Contactless */}
                      <div className="flex items-center gap-3">
                        <svg className="w-10 h-7 rounded-sm shadow-xs" viewBox="0 0 40 28" fill="none">
                          <rect width="40" height="28" rx="4" fill="url(#emvGoldGrad)" stroke="#CBB084" strokeWidth="0.5" />
                          <path d="M14 0v28M26 0v28M0 14h40M14 9h12M14 19h12" stroke="#8A704C" strokeWidth="0.8" opacity="0.6" />
                          <rect x="16" y="11" width="8" height="6" rx="1" fill="#DFC296" opacity="0.8" />
                          <defs>
                            <linearGradient id="emvGoldGrad" x1="0" y1="0" x2="40" y2="28" gradientUnits="userSpaceOnUse">
                              <stop stopColor="#DFC296" />
                              <stop offset="0.5" stopColor="#F4F0EA" />
                              <stop offset="1" stopColor="#CBB084" />
                            </linearGradient>
                          </defs>
                        </svg>
                        <span className="text-sm text-white/50 font-mono font-bold">)))</span>
                      </div>
                    </div>

                    {/* Card Middle: 16-Digit Card Number with Copy */}
                    <div className="my-3 sm:my-4 relative z-10">
                      <div className="font-mono text-base sm:text-lg tracking-[0.22em] dir-ltr text-center text-[#F4F0EA] font-bold p-2.5 rounded-2xl bg-black/40 border border-white/[0.08] flex items-center justify-between px-4">
                        <span>{formatCardNumber(acc.cardNumber || '•••• •••• •••• ••••')}</span>
                        {acc.cardNumber && (
                          <button
                            type="button"
                            onClick={(e) => handleCopy(acc.cardNumber || '', acc.id + '-card', e)}
                            className="p-1.5 rounded-lg text-[#8E8B82] hover:text-[#DFC296] hover:bg-white/[0.08] transition"
                            title="کپی شماره کارت"
                          >
                            {copiedId === acc.id + '-card' ? (
                              <Check className="w-4 h-4 text-[#7A9A95]" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Card Bottom Row: Cardholder Name & Sheba / Status */}
                    <div className="flex items-center justify-between text-[11px] font-mono text-[#8E8B82] uppercase tracking-wider relative z-10 border-t border-white/[0.08] pt-3">
                      <div>
                        <span className="text-[10px] text-[#8E8B82] block">دارنده کارت:</span>
                        <span className="text-xs font-bold text-[#F4F0EA] truncate block max-w-[160px]">
                          {acc.name}
                        </span>
                      </div>

                      {acc.shaba ? (
                        <div className="text-left dir-ltr">
                          <span className="text-[10px] text-[#8E8B82] block">شماره شبا:</span>
                          <span className="text-xs font-bold text-[#DFC296] font-mono flex items-center gap-1">
                            <span>IR{acc.shaba.slice(-8)}</span>
                            <button
                              type="button"
                              onClick={(e) => handleCopy(`IR${acc.shaba}`, acc.id + '-shaba', e)}
                              className="text-[#8E8B82] hover:text-[#DFC296]"
                              title="کپی شماره شبا"
                            >
                              {copiedId === acc.id + '-shaba' ? (
                                <Check className="w-3 h-3 text-[#7A9A95]" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs font-mono text-[#DFC296]">
                          {formatCurrency(acc.balance, currency)}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. Selected Card Hero Balance & Metadata Bar */}
        {selectedCard && (
          <div className="max-w-xl mx-auto w-full space-y-6 pt-2">
            <div className="rounded-3xl p-6 sm:p-7 bg-[#121215]/95 border border-white/[0.08] shadow-[0_20px_45px_rgba(0,0,0,0.9)] backdrop-blur-2xl space-y-5">
              {/* Metadata Micro-Label */}
              <div className="flex items-center justify-between">
                <span className="text-[11px] tracking-[0.2em] text-[#8E8B82] uppercase font-mono">
                  {selectedCard.bankName || 'کارت فعال'} •{' '}
                  {selectedCard.cardNumber ? `پایان به ${selectedCard.cardNumber.slice(-4)}` : selectedCard.name}
                </span>
                <span className="bg-[#DFC296]/10 text-[#DFC296] border border-[#DFC296]/20 rounded-full px-3 py-1 text-xs tabular-nums font-mono font-bold">
                  {getAccountTypeLabel(selectedCard.type)}
                </span>
              </div>

              {/* Hero Balance */}
              <div className="flex items-baseline justify-between gap-4 flex-wrap">
                <div>
                  <span className="text-xs text-[#8E8B82] block font-mono mb-1">موجودی فعلی حساب:</span>
                  <div className="text-4xl sm:text-5xl font-serif font-light tracking-tight text-[#F4F0EA] tabular-nums">
                    {formatCurrency(selectedCard.balance, currency)}
                  </div>
                </div>

                {typeof selectedCard.initialBalance === 'number' &&
                  selectedCard.initialBalance !== selectedCard.balance && (
                    <div className="text-left text-xs font-mono text-[#8E8B82]">
                      <span className="block text-[10px]">مانده اولیه:</span>
                      <span className="text-[#F4F0EA]/70">
                        {formatCurrency(selectedCard.initialBalance, currency)}
                      </span>
                    </div>
                  )}
              </div>

              {/* 4 Circular Quick-Action Buttons Row */}
              <div className="pt-4 border-t border-white/[0.07]">
                <div className="grid grid-cols-4 gap-2 sm:gap-4 place-items-center">
                  {/* Action 1: ثبت هزینه */}
                  <div className="flex flex-col items-center">
                    <button
                      type="button"
                      onClick={handleQuickExpense}
                      className="w-14 h-14 rounded-full border border-white/[0.09] bg-[#121215] hover:bg-[#1A191E] hover:border-[#DFC296]/50 active:scale-95 transition-all flex items-center justify-center text-[#F4F0EA] shadow-lg group"
                      title="ثبت هزینه از این کارت"
                    >
                      <ArrowUpRight className="w-5 h-5 text-[#C98A82] group-hover:scale-110 transition-transform stroke-[1.8]" />
                    </button>
                    <span className="text-[11px] text-[#8E8B82] mt-2 tracking-wide font-sans text-center">
                      ثبت هزینه
                    </span>
                  </div>

                  {/* Action 2: افزایش موجودی */}
                  <div className="flex flex-col items-center">
                    <button
                      type="button"
                      onClick={handleQuickIncome}
                      className="w-14 h-14 rounded-full border border-white/[0.09] bg-[#121215] hover:bg-[#1A191E] hover:border-[#DFC296]/50 active:scale-95 transition-all flex items-center justify-center text-[#F4F0EA] shadow-lg group"
                      title="افزایش موجودی و واریز"
                    >
                      <ArrowDownLeft className="w-5 h-5 text-[#7A9A95] group-hover:scale-110 transition-transform stroke-[1.8]" />
                    </button>
                    <span className="text-[11px] text-[#8E8B82] mt-2 tracking-wide font-sans text-center">
                      واریز وجه
                    </span>
                  </div>

                  {/* Action 3: انتقال وجه */}
                  <div className="flex flex-col items-center">
                    <button
                      type="button"
                      onClick={handleQuickTransfer}
                      className="w-14 h-14 rounded-full border border-white/[0.09] bg-[#121215] hover:bg-[#1A191E] hover:border-[#DFC296]/50 active:scale-95 transition-all flex items-center justify-center text-[#F4F0EA] shadow-lg group"
                      title="انتقال به کارت دیگر"
                    >
                      <ArrowLeftRight className="w-5 h-5 text-[#DFC296] group-hover:scale-110 transition-transform stroke-[1.8]" />
                    </button>
                    <span className="text-[11px] text-[#8E8B82] mt-2 tracking-wide font-sans text-center">
                      انتقال
                    </span>
                  </div>

                  {/* Action 4: جزئیات / ویرایش */}
                  <div className="flex flex-col items-center">
                    <button
                      type="button"
                      onClick={handleQuickEdit}
                      className="w-14 h-14 rounded-full border border-white/[0.09] bg-[#121215] hover:bg-[#1A191E] hover:border-[#DFC296]/50 active:scale-95 transition-all flex items-center justify-center text-[#F4F0EA] shadow-lg group"
                      title="ویرایش یا حذف حساب"
                    >
                      <SlidersHorizontal className="w-5 h-5 text-[#8E8B82] group-hover:text-[#DFC296] group-hover:scale-110 transition-all stroke-[1.8]" />
                    </button>
                    <span className="text-[11px] text-[#8E8B82] mt-2 tracking-wide font-sans text-center">
                      مدیریت
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 5. Minimalist Recent Transactions for Selected Card */}
            <div className="rounded-3xl p-6 bg-[#121215]/90 border border-white/[0.08] shadow-xl backdrop-blur-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.07]">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#DFC296]" />
                  <h3 className="text-xs font-bold font-mono tracking-wider text-[#F4F0EA] uppercase">
                    تراکنش‌های اخیر (RECENT)
                  </h3>
                </div>

                {onSelectTab && (
                  <button
                    type="button"
                    onClick={() => onSelectTab('transactions')}
                    className="flex items-center gap-1 text-[11px] font-mono text-[#8E8B82] hover:text-[#DFC296] transition"
                  >
                    <span>مشاهده همه</span>
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {cardTransactions.length === 0 ? (
                <div className="py-6 text-center text-xs text-[#8E8B82] font-sans">
                  هیچ تراکنشی اخیراً برای این کارت ثبت نشده است.
                </div>
              ) : (
                <div className="divide-y divide-white/[0.06]">
                  {cardTransactions.map((tx) => {
                    const cat = categories.find((c) => c.id === tx.categoryId);
                    const isExpense = tx.type === 'expense';
                    const isIncome = tx.type === 'income';

                    return (
                      <div
                        key={tx.id}
                        className="py-3 flex items-center justify-between gap-3 group transition"
                      >
                        {/* Right: Category Icon & Title */}
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-full bg-white/[0.04] border border-white/[0.07] flex items-center justify-center text-[#DFC296] shrink-0">
                            {cat ? getCategoryIcon(cat.icon, 'w-4 h-4') : <Sparkles className="w-4 h-4" />}
                          </div>
                          <div className="min-w-0">
                            <span className="text-sm font-medium text-[#F4F0EA] truncate block">
                              {tx.description || cat?.name || 'تراکنش'}
                            </span>
                            <span className="text-[11px] text-[#8E8B82] font-mono block mt-0.5">
                              {tx.date} {tx.time ? `• ${tx.time}` : ''}
                            </span>
                          </div>
                        </div>

                        {/* Left: Formatted Amount */}
                        <div className="text-left font-mono text-sm tabular-nums shrink-0 font-bold">
                          <span
                            className={
                              isExpense
                                ? 'text-[#F4F0EA]'
                                : isIncome
                                ? 'text-[#7A9A95]'
                                : 'text-[#DFC296]'
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
            </div>
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

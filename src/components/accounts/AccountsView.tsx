import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Account, AccountType } from '../../types';
import { formatCurrency, formatCardNumber, toPersianDigits } from '../../utils/formatters';
import { AccountModal } from './AccountModal';
import { TransferModal } from './TransferModal';
import { CollapsibleSection } from '../common/CollapsibleSection';
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
  Landmark,
  ShieldCheck,
} from 'lucide-react';

export const AccountsView: React.FC = () => {
  const { accounts, totalBalance, currency, deleteAccount } = useFinance();

  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = (id: string) => {
    if (accounts.length <= 1) {
      alert('حداقل یک حساب باید در سیستم باقی بماند.');
      return;
    }
    if (window.confirm('آیا از حذف این حساب اطمینان دارید؟ موجودی و تراکنش‌های آن بررسی شوند.')) {
      deleteAccount(id);
    }
  };

  const getAccountTypeLabel = (type: AccountType) => {
    switch (type) {
      case 'bank':
        return 'کارت و حساب بانکی';
      case 'cash':
        return 'کیف پول نقدی';
      case 'savings':
        return 'پس‌انداز و سرمایه‌گذاری';
      default:
        return 'حساب مالی';
    }
  };

  // Grouped stats
  const bankAccounts = accounts.filter((a) => a.type === 'bank');
  const cashAccounts = accounts.filter((a) => a.type === 'cash');
  const savingsAccounts = accounts.filter((a) => a.type === 'savings');

  const bankTotal = bankAccounts.reduce((sum, a) => sum + a.balance, 0);
  const cashTotal = cashAccounts.reduce((sum, a) => sum + a.balance, 0);
  const savingsTotal = savingsAccounts.reduce((sum, a) => sum + a.balance, 0);

  return (
    <div className="space-y-6 pb-12 select-none">
      {/* 1. Header & Summary Banner */}
      <div className="rounded-3xl p-6 sm:p-7 bg-gradient-to-br from-white via-[#F7F7F2] to-[#EAE4DC] text-[#1F2933] border border-[#A68A64]/30 shadow-lg dark:from-[#1F2933] dark:via-[#141B22] dark:to-[#1F2933] dark:text-[#F7F7F2] dark:border-[#6B7280]/20 dark:shadow-2xl relative overflow-hidden">
        {/* Subtle Warm Wood Sheen */}
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-[#A68A64]/10 dark:bg-[#A68A64]/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#A68A64] shadow-xs shadow-[#A68A64]/50" />
              <span className="text-xs font-bold text-[#A68A64] uppercase tracking-wider">
                موجودی نقدینگی کل سیستم
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black font-mono tracking-tight text-[#1F2933] dark:text-[#F7F7F2]">
              {formatCurrency(totalBalance, currency)}
            </h2>
            <p className="text-xs text-[#6B7280] dark:text-[#D1D5DB]/80 mt-1.5">
              مجموع موجودی {toPersianDigits(accounts.length)} حساب بانکی، کیف‌پول و صندوق پس‌انداز
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => setIsTransferModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#1F2933]/5 hover:bg-[#1F2933]/10 dark:bg-white/10 dark:hover:bg-white/15 text-[#1F2933] dark:text-[#F7F7F2] text-xs font-bold transition active:scale-95 border border-[#6B7280]/20 dark:border-transparent"
            >
              <ArrowLeftRight className="w-4 h-4 text-[#A68A64]" />
              <span>انتقال بین حساب‌ها</span>
            </button>

            <button
              onClick={() => {
                setEditingAccount(null);
                setIsAccountModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#A68A64] hover:bg-[#8A704C] text-[#F7F7F2] text-xs font-bold shadow-md shadow-[#A68A64]/25 transition active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>+ افزودن حساب جدید</span>
            </button>
          </div>
        </div>

        {/* Breakdown by Account Type */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-5 border-t border-[#6B7280]/15 dark:border-white/10 relative z-10">
          <div className="p-3 rounded-2xl bg-white/70 dark:bg-white/5 border border-[#6B7280]/15 dark:border-white/10 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-[#6B7280] dark:text-[#D1D5DB]/70 block font-medium">کارت‌های بانکی ({toPersianDigits(bankAccounts.length)})</span>
              <span className="font-bold font-mono text-xs sm:text-sm text-[#1F2933] dark:text-[#F7F7F2]">{formatCurrency(bankTotal, currency)}</span>
            </div>
            <CreditCard className="w-4 h-4 text-[#A68A64]" />
          </div>

          <div className="p-3 rounded-2xl bg-white/70 dark:bg-white/5 border border-[#6B7280]/15 dark:border-white/10 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-[#6B7280] dark:text-[#D1D5DB]/70 block font-medium">کیف پول نقدی ({toPersianDigits(cashAccounts.length)})</span>
              <span className="font-bold font-mono text-xs sm:text-sm text-[#1F2933] dark:text-[#F7F7F2]">{formatCurrency(cashTotal, currency)}</span>
            </div>
            <Wallet className="w-4 h-4 text-[#A68A64]" />
          </div>

          <div className="p-3 rounded-2xl bg-white/70 dark:bg-white/5 border border-[#6B7280]/15 dark:border-white/10 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-[#6B7280] dark:text-[#D1D5DB]/70 block font-medium">پس‌انداز و ذخایر ({toPersianDigits(savingsAccounts.length)})</span>
              <span className="font-bold font-mono text-xs sm:text-sm text-[#1F2933] dark:text-[#F7F7F2]">{formatCurrency(savingsTotal, currency)}</span>
            </div>
            <PiggyBank className="w-4 h-4 text-[#A68A64]" />
          </div>
        </div>
      </div>

      {/* 2. Nordic Luxury Bank Cards Grid */}
      <CollapsibleSection
        storageKey="accounts_grid"
        title="کارت‌های بانکی و حساب‌ها"
        subtitle={`${toPersianDigits(accounts.length)} حساب فعال با قابلیت کپی سریع شماره کارت و شبا`}
        icon={<CreditCard className="w-5 h-5 text-[#A68A64]" />}
        defaultExpanded={true}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-1">
          {accounts.map((acc) => {
            return (
              <div
                key={acc.id}
                className="rounded-3xl p-6 bg-gradient-to-br from-[#F7F7F2] via-[#EAE6DF] to-[#D1D5DB]/70 text-[#1F2933] border border-[#A68A64]/30 shadow-lg dark:from-[#1F2933] dark:via-[#141B22] dark:to-[#1F2933] dark:text-[#F7F7F2] dark:border-[#6B7280]/20 dark:shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[230px] transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl group"
              >
                {/* Nordic Warm Wood Metallic Corner Glow */}
                <div className="absolute top-0 right-0 w-36 h-36 bg-[#A68A64]/10 dark:bg-[#A68A64]/15 rounded-full blur-3xl pointer-events-none group-hover:bg-[#A68A64]/25 transition" />

                {/* Card Top: Bank Badge & Account Name */}
                <div className="flex items-start justify-between relative z-10">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded-lg bg-[#A68A64]/15 dark:bg-white/10 text-[#A68A64]">
                        <Building2 className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-semibold text-[#6B7280] dark:text-[#D1D5DB]/80">{acc.bankName || 'حساب من'}</span>
                      {acc.isDefault && (
                        <span className="bg-[#A68A64]/20 border border-[#A68A64]/40 text-[#A68A64] text-[10px] font-bold px-2 py-0.2 rounded-full mr-1">
                          پیش‌فرض
                        </span>
                      )}
                    </div>
                    <h3 className="text-base sm:text-lg font-black text-[#1F2933] dark:text-[#F7F7F2] mt-1.5">{acc.name}</h3>
                  </div>

                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-xl bg-black/5 dark:bg-white/10 text-[#6B7280] dark:text-[#D1D5DB] border border-black/5 dark:border-white/10">
                    {getAccountTypeLabel(acc.type)}
                  </span>
                </div>

                {/* Card Middle: 16-Digit Card Number with 1-Click Copy */}
                {acc.cardNumber ? (
                  <div className="my-3 space-y-2 relative z-10">
                    {/* Metallic Chip Visual */}
                    <div className="w-8 h-6 rounded-md bg-gradient-to-tr from-[#A68A64] to-[#C2A882] shadow-xs border border-white/40" />

                    <div className="font-mono text-sm sm:text-base tracking-widest dir-ltr font-bold text-center text-[#1F2933] dark:text-[#F7F7F2] flex items-center justify-center gap-2 p-1.5 rounded-xl bg-white/60 dark:bg-white/5 border border-[#6B7280]/15 dark:border-white/10">
                      <span>{formatCardNumber(acc.cardNumber)}</span>
                      <button
                        onClick={() => handleCopy(acc.cardNumber || '', acc.id + '-card')}
                        className="p-1 rounded-lg text-[#6B7280] dark:text-[#D1D5DB] hover:text-[#1F2933] dark:hover:text-[#F7F7F2] hover:bg-black/5 dark:hover:bg-white/10 transition"
                        title="کپی شماره کارت"
                      >
                        {copiedId === acc.id + '-card' ? (
                          <span className="flex items-center gap-1 text-[10px] text-[#2E7D5B] dark:text-[#4ADE80] font-bold">
                            <Check className="w-3.5 h-3.5" /> کپی شد
                          </span>
                        ) : (
                          <Copy className="w-3.5 h-3.5 text-[#A68A64]" />
                        )}
                      </button>
                    </div>

                    {/* Sheba Number (IBAN) if available */}
                    {acc.shaba && (
                      <div className="flex items-center justify-between text-[11px] font-mono text-[#6B7280] dark:text-[#D1D5DB]/80 px-1 dir-ltr">
                        <span className="truncate">IR{acc.shaba}</span>
                        <button
                          onClick={() => handleCopy(`IR${acc.shaba}`, acc.id + '-shaba')}
                          className="text-[#A68A64] hover:text-[#8A704C] transition p-0.5 ml-1"
                          title="کپی شماره شبا"
                        >
                          {copiedId === acc.id + '-shaba' ? (
                            <Check className="w-3 h-3 text-[#2E7D5B] dark:text-[#4ADE80]" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="my-4 text-xs text-[#6B7280] dark:text-[#D1D5DB]/60 relative z-10">
                    کیف پول نقدی و موجودی جاری بدون شماره کارت
                  </div>
                )}

                {/* Card Footer: Live Balance & Actions */}
                <div className="pt-3 border-t border-[#6B7280]/15 dark:border-white/10 flex items-center justify-between relative z-10">
                  <div>
                    <span className="text-[10px] text-[#6B7280] dark:text-[#D1D5DB]/70 block">موجودی فعلی:</span>
                    <span className="text-lg font-black font-mono tracking-tight text-[#1F2933] dark:text-[#F7F7F2] block">
                      {formatCurrency(acc.balance, currency)}
                    </span>
                    {typeof acc.initialBalance === 'number' && acc.initialBalance !== acc.balance && (
                      <span className="text-[10px] text-[#6B7280]/70 dark:text-[#D1D5DB]/50 font-mono block">
                        مانده اولیه: {formatCurrency(acc.initialBalance, currency)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        setEditingAccount(acc);
                        setIsAccountModalOpen(true);
                      }}
                      className="p-2 rounded-xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-[#6B7280] dark:text-[#D1D5DB] hover:text-[#1F2933] dark:hover:text-[#F7F7F2] transition"
                      title="ویرایش حساب"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(acc.id)}
                      className="p-2 rounded-xl bg-black/5 dark:bg-white/10 hover:bg-[#C0564B] hover:text-white text-[#6B7280] dark:text-[#D1D5DB] transition"
                      title="حذف حساب"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CollapsibleSection>

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
        onClose={() => setIsTransferModalOpen(false)}
      />
    </div>
  );
};

export default AccountsView;

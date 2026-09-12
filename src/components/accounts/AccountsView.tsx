import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Account, AccountType } from '../../types';
import { formatCurrency, formatCardNumber, toPersianDigits } from '../../utils/formatters';
import { AccountModal } from './AccountModal';
import { TransferModal } from './TransferModal';
import {
  CreditCard,
  Wallet,
  Coins,
  PiggyBank,
  Plus,
  ArrowLeftRight,
  Edit2,
  Trash2,
  Copy,
  Check,
  Building2,
} from 'lucide-react';

export const AccountsView: React.FC = () => {
  const { accounts, totalBalance, currency, deleteAccount } = useFinance();

  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = (id: string) => {
    if (accounts.length <= 1) {
      alert('حداقل یک حساب باید در سیستم باقی بماند.');
      return;
    }
    if (window.confirm('آیا از حذف این حساب اطمینان دارید؟')) {
      deleteAccount(id);
    }
  };

  const getAccountTypeIcon = (type: AccountType) => {
    switch (type) {
      case 'bank': return CreditCard;
      case 'cash': return Wallet;
      case 'savings': return PiggyBank;
      case 'gold_crypto': return Coins;
      default: return Wallet;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">کارت‌ها و حساب‌های مالی</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            مجموع موجودی: {formatCurrency(totalBalance, currency)} ({toPersianDigits(accounts.length)} حساب)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsTransferModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-semibold transition"
          >
            <ArrowLeftRight className="w-4 h-4 text-indigo-500" />
            <span>انتقال بین حسابی</span>
          </button>
          <button
            onClick={() => {
              setEditingAccount(null);
              setIsAccountModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>افزودن حساب جدید</span>
          </button>
        </div>
      </div>

      {/* Grid of Bank Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {accounts.map(acc => {
          const Icon = getAccountTypeIcon(acc.type);
          return (
            <div
              key={acc.id}
              className="rounded-3xl p-6 text-white relative overflow-hidden shadow-lg flex flex-col justify-between min-h-[220px] transition-transform hover:-translate-y-1"
              style={{
                backgroundColor: acc.color || '#4f46e5',
                backgroundImage: 'radial-gradient(circle at 100% 0%, rgba(255,255,255,0.2) 0%, transparent 60%)',
              }}
            >
              {/* Card Top */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5 opacity-85 text-xs font-medium">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>{acc.bankName || 'حساب من'}</span>
                    {acc.isDefault && (
                      <span className="bg-white/20 text-white text-[10px] px-2 py-0.5 rounded-full mr-1">
                        پیش‌فرض
                      </span>
                    )}
                  </div>
                  <h3 className="text-base sm:text-lg font-black mt-1">{acc.name}</h3>
                </div>

                <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
              </div>

              {/* Card Number / Chip */}
              {acc.cardNumber ? (
                <div className="my-3 space-y-1">
                  <div className="w-8 h-6 rounded bg-amber-300/80 border border-amber-400 mb-2" />
                  <div className="font-mono text-sm sm:text-base tracking-widest dir-ltr font-bold text-center select-all flex items-center justify-center gap-2">
                    <span>{formatCardNumber(acc.cardNumber)}</span>
                    <button
                      onClick={() => handleCopy(acc.cardNumber || '', acc.id + '-card')}
                      className="opacity-70 hover:opacity-100 transition p-1"
                      title="کپی شماره کارت"
                    >
                      {copiedId === acc.id + '-card' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-300" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="my-4 opacity-75 text-xs">کیف پول نقدی و دارایی‌های جاری</div>
              )}

              {/* Card Footer: Balance & Actions */}
              <div className="pt-3 border-t border-white/20 flex items-center justify-between">
                <div>
                  <span className="text-[10px] opacity-75 block">موجودی فعلی:</span>
                  <span className="text-lg font-black tracking-tight">
                    {formatCurrency(acc.balance, currency)}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setEditingAccount(acc);
                      setIsAccountModalOpen(true);
                    }}
                    className="p-1.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-sm transition"
                    title="ویرایش حساب"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(acc.id)}
                    className="p-1.5 rounded-xl bg-white/20 hover:bg-rose-500/80 backdrop-blur-sm transition"
                    title="حذف حساب"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
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
        onClose={() => setIsTransferModalOpen(false)}
      />
    </div>
  );
};

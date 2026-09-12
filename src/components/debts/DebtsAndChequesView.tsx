import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Debt, Cheque } from '../../types';
import { formatCurrency, toPersianDigits } from '../../utils/formatters';
import { formatJalaliLong } from '../../utils/jalali';
import { DebtModal } from './DebtModal';
import { ChequeModal } from './ChequeModal';
import {
  FileCheck2,
  Users,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  Phone,
  ArrowUpRight,
  ArrowDownLeft,
  X,
  Check,
} from 'lucide-react';

export const DebtsAndChequesView: React.FC = () => {
  const {
    debts,
    cheques,
    currency,
    deleteDebt,
    payDebt,
    deleteCheque,
    changeChequeStatus,
  } = useFinance();

  const [activeTab, setActiveTab] = useState<'debts' | 'cheques'>('debts');

  // Modals
  const [isDebtModalOpen, setIsDebtModalOpen] = useState(false);
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);

  const [isChequeModalOpen, setIsChequeModalOpen] = useState(false);
  const [editingCheque, setEditingCheque] = useState<Cheque | null>(null);

  // Pay Debt Modal
  const [payingDebt, setPayingDebt] = useState<Debt | null>(null);
  const [payAmount, setPayAmount] = useState('');

  // Computations
  const totalCredits = debts
    .filter(d => d.type === 'credit' && !d.isSettled)
    .reduce((sum, d) => sum + (d.amount - d.paidAmount), 0);

  const totalDebts = debts
    .filter(d => d.type === 'debt' && !d.isSettled)
    .reduce((sum, d) => sum + (d.amount - d.paidAmount), 0);

  const totalPendingChequesReceivable = cheques
    .filter(c => c.type === 'receivable' && c.status === 'pending')
    .reduce((sum, c) => sum + c.amount, 0);

  const totalPendingChequesPayable = cheques
    .filter(c => c.type === 'payable' && c.status === 'pending')
    .reduce((sum, c) => sum + c.amount, 0);

  const handleDeleteDebt = (id: string) => {
    if (window.confirm('آیا از حذف این مورد اطمینان دارید؟')) {
      deleteDebt(id);
    }
  };

  const handleDeleteCheque = (id: string) => {
    if (window.confirm('آیا از حذف این چک اطمینان دارید؟')) {
      deleteCheque(id);
    }
  };

  const handlePaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingDebt) return;
    const num = parseFloat(payAmount);
    if (isNaN(num) || num <= 0) {
      alert('لطفاً مبلغ معتبری وارد کنید.');
      return;
    }
    payDebt(payingDebt.id, num);
    setPayingDebt(null);
    setPayAmount('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            مدیریت بدهی، طلب، اقساط و چک‌ها
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            ردگیری سررسید تسویه‌ها و پیشگیری از فراموشی چک‌ها
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'debts' ? (
            <button
              onClick={() => {
                setEditingDebt(null);
                setIsDebtModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              <span>ثبت بدهی / طلب جدید</span>
            </button>
          ) : (
            <button
              onClick={() => {
                setEditingCheque(null);
                setIsChequeModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              <span>ثبت چک صیادی</span>
            </button>
          )}
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-2 p-1.5 bg-slate-200/70 dark:bg-slate-800 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('debts')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'debts'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>بدهی‌ها، طلب‌ها و اقساط</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800">
            {toPersianDigits(debts.length)}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('cheques')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'cheques'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          <span>چک‌های صیادی</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800">
            {toPersianDigits(cheques.length)}
          </span>
        </button>
      </div>

      {/* Tab 1: Debts and Credits */}
      {activeTab === 'debts' && (
        <div className="space-y-5">
          {/* Summary stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="glass-card p-4 border-l-4 border-l-emerald-500 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500">مجموع طلب‌های وصول نشده (دارایی شما)</span>
                <h4 className="text-lg font-black text-emerald-600 mt-1">
                  {formatCurrency(totalCredits, currency)}
                </h4>
              </div>
              <ArrowDownLeft className="w-8 h-8 text-emerald-500/30" />
            </div>

            <div className="glass-card p-4 border-l-4 border-l-rose-500 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500">مجموع بدهی‌های پرداخت نشده (تعهد شما)</span>
                <h4 className="text-lg font-black text-rose-600 mt-1">
                  {formatCurrency(totalDebts, currency)}
                </h4>
              </div>
              <ArrowUpRight className="w-8 h-8 text-rose-500/30" />
            </div>
          </div>

          {/* List of Debts */}
          <div className="space-y-3">
            {debts.length === 0 ? (
              <div className="glass-card p-12 text-center text-slate-400 text-xs">
                هیچ بدهی یا طلبی ثبت نشده است.
              </div>
            ) : (
              debts.map(item => {
                const remaining = item.amount - item.paidAmount;
                const percent = Math.min(100, Math.round((item.paidAmount / item.amount) * 100));

                return (
                  <div
                    key={item.id}
                    className={`glass-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition ${
                      item.isSettled ? 'opacity-65 bg-slate-50/50 dark:bg-slate-900/40' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 text-white ${
                          item.type === 'credit' ? 'bg-emerald-600' : 'bg-rose-600'
                        }`}
                      >
                        {item.type === 'credit' ? (
                          <ArrowDownLeft className="w-5 h-5" />
                        ) : (
                          <ArrowUpRight className="w-5 h-5" />
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                            {item.personName}
                          </h4>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              item.isSettled
                                ? 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                                : item.type === 'credit'
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40'
                                : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40'
                            }`}
                          >
                            {item.isSettled
                              ? 'تسویه شده'
                              : item.type === 'credit'
                              ? 'طلب من'
                              : 'بدهی من'}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-1">
                          <span>سررسید: {toPersianDigits(item.dueDate)}</span>
                          {item.phoneNumber && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1 dir-ltr">
                                <Phone className="w-3 h-3 text-slate-400" />
                                {toPersianDigits(item.phoneNumber)}
                              </span>
                            </>
                          )}
                          {item.description && (
                            <>
                              <span>•</span>
                              <span>{item.description}</span>
                            </>
                          )}
                        </div>

                        {/* Partial Progress */}
                        {item.paidAmount > 0 && !item.isSettled && (
                          <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-500">
                            <span>پرداخت شده: {formatCurrency(item.paidAmount, currency)} ({toPersianDigits(percent)}٪)</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-slate-100 dark:border-slate-800">
                      <div className="text-right sm:text-left">
                        <div
                          className={`text-sm sm:text-base font-black ${
                            item.type === 'credit' ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        >
                          {formatCurrency(item.amount, currency)}
                        </div>
                        {!item.isSettled && item.paidAmount > 0 && (
                          <span className="text-[11px] text-slate-400 block">
                            مانده: {formatCurrency(remaining, currency)}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        {!item.isSettled && (
                          <button
                            onClick={() => {
                              setPayingDebt(item);
                              setPayAmount(remaining.toString());
                            }}
                            className="px-2.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/80 text-indigo-700 dark:text-indigo-300 text-xs font-bold transition"
                          >
                            ثبت تسویه
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setEditingDebt(item);
                            setIsDebtModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteDebt(item.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Cheques */}
      {activeTab === 'cheques' && (
        <div className="space-y-5">
          {/* Summary stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="glass-card p-4 border-l-4 border-l-indigo-500 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500">مجموع چک‌های در جریان دریافتی</span>
                <h4 className="text-lg font-black text-indigo-600 mt-1">
                  {formatCurrency(totalPendingChequesReceivable, currency)}
                </h4>
              </div>
              <Clock className="w-8 h-8 text-indigo-500/30" />
            </div>

            <div className="glass-card p-4 border-l-4 border-l-amber-500 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500">مجموع چک‌های در جریان پرداختی</span>
                <h4 className="text-lg font-black text-amber-600 mt-1">
                  {formatCurrency(totalPendingChequesPayable, currency)}
                </h4>
              </div>
              <FileCheck2 className="w-8 h-8 text-amber-500/30" />
            </div>
          </div>

          {/* Cheque List */}
          <div className="space-y-3">
            {cheques.length === 0 ? (
              <div className="glass-card p-12 text-center text-slate-400 text-xs">
                هیچ چکی ثبت نشده است.
              </div>
            ) : (
              cheques.map(cheque => (
                <div
                  key={cheque.id}
                  className="glass-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 text-white ${
                        cheque.status === 'passed'
                          ? 'bg-emerald-600'
                          : cheque.status === 'bounced'
                          ? 'bg-rose-600'
                          : 'bg-indigo-600'
                      }`}
                    >
                      <FileCheck2 className="w-5 h-5" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          {cheque.partyName}
                        </h4>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            cheque.type === 'receivable'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40'
                              : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40'
                          }`}
                        >
                          {cheque.type === 'receivable' ? 'چک دریافتی' : 'چک پرداختی'}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            cheque.status === 'passed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : cheque.status === 'bounced'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {cheque.status === 'passed'
                            ? 'پاس شده'
                            : cheque.status === 'bounced'
                            ? 'برگشت خورده'
                            : 'در جریان'}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-1">
                        <span>سررسید: {toPersianDigits(cheque.dueDate)}</span>
                        <span>•</span>
                        <span>بانک: {cheque.bankName}</span>
                        <span>•</span>
                        <span>سریال: {toPersianDigits(cheque.chequeNumber)}</span>
                        {cheque.sayadNumber && (
                          <>
                            <span>•</span>
                            <span className="font-mono text-[11px] dir-ltr text-indigo-500">
                              صیاد: {toPersianDigits(cheque.sayadNumber)}
                            </span>
                          </>
                        )}
                        {cheque.notes && (
                          <>
                            <span>•</span>
                            <span>{cheque.notes}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-slate-100 dark:border-slate-800">
                    <div className="text-right sm:text-left">
                      <div className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                        {formatCurrency(cheque.amount, currency)}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {cheque.status === 'pending' && (
                        <button
                          onClick={() => changeChequeStatus(cheque.id, 'passed')}
                          className="px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition"
                          title="تغییر وضعیت به پاس شده"
                        >
                          پاس شد
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setEditingCheque(cheque);
                          setIsChequeModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCheque(cheque.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Pay Debt Modal */}
      {payingDebt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                ثبت تسویه / پرداخت برای {payingDebt.personName}
              </h4>
              <button
                onClick={() => setPayingDebt(null)}
                className="p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handlePaySubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  مبلغ پرداختی ({currency === 'toman' ? 'تومان' : 'ریال'})
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>ثبت پرداخت</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modals */}
      <DebtModal
        isOpen={isDebtModalOpen}
        onClose={() => {
          setIsDebtModalOpen(false);
          setEditingDebt(null);
        }}
        initialDebt={editingDebt}
      />

      <ChequeModal
        isOpen={isChequeModalOpen}
        onClose={() => {
          setIsChequeModalOpen(false);
          setEditingCheque(null);
        }}
        initialCheque={editingCheque}
      />
    </div>
  );
};

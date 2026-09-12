import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Debt, Cheque } from '../../types';
import { formatCurrency, toPersianDigits } from '../../utils/formatters';
import { formatJalaliLong } from '../../utils/jalali';
import { DebtModal } from './DebtModal';
import { ChequeModal } from './ChequeModal';
import { PayDebtModal } from './PayDebtModal';
import { PersonManagerModal } from '../contacts/PersonManagerModal';
import { CollapsibleSection } from '../common/CollapsibleSection';
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
  Scale,
  Calendar,
  ChevronDown,
  ChevronUp,
  CreditCard,
} from 'lucide-react';

export const DebtsAndChequesView: React.FC = () => {
  const {
    debts,
    cheques,
    currency,
    deleteDebt,
    deleteCheque,
    changeChequeStatus,
  } = useFinance();

  const [activeTab, setActiveTab] = useState<'debts' | 'cheques'>('debts');

  // Modals
  const [isDebtModalOpen, setIsDebtModalOpen] = useState(false);
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);
  const [isPersonModalOpen, setIsPersonModalOpen] = useState(false);

  const [isChequeModalOpen, setIsChequeModalOpen] = useState(false);
  const [editingCheque, setEditingCheque] = useState<Cheque | null>(null);

  // Pay Debt Modal
  const [payingDebt, setPayingDebt] = useState<Debt | null>(null);
  const [expandedDebtId, setExpandedDebtId] = useState<string | null>(null);

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

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            مدیریت بدهی، طلب، اقساط و چک‌ها
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            ردگیری سررسید تسویه‌ها و پیشگیری از فراموشی چک‌ها
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <button
            onClick={() => setIsPersonModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl liquid-glass text-slate-700 dark:text-slate-200 text-xs font-bold hover:border-indigo-400 transition"
            title="مدیریت اشخاص و طرف‌حساب‌ها"
          >
            <Users className="w-4 h-4 text-indigo-500" />
            <span className="whitespace-nowrap">مدیریت طرف‌حساب‌ها</span>
          </button>

          {activeTab === 'debts' ? (
            <button
              onClick={() => {
                setEditingDebt(null);
                setIsDebtModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-black shadow-md shadow-indigo-500/20 transition active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span className="whitespace-nowrap">ثبت بدهی / طلب جدید</span>
            </button>
          ) : (
            <button
              onClick={() => {
                setEditingCheque(null);
                setIsChequeModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-black shadow-md shadow-indigo-500/20 transition active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span className="whitespace-nowrap">ثبت چک صیادی</span>
            </button>
          )}
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-2 p-1.5 liquid-glass rounded-2xl w-fit border border-slate-200/50 dark:border-white/10">
        <button
          onClick={() => setActiveTab('debts')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'debts'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>بدهی‌ها، طلب‌ها و اقساط</span>
          <span
            className={`text-[10px] px-1.5 py-0.5 rounded-full ${
              activeTab === 'debts' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-800'
            }`}
          >
            {toPersianDigits(debts.length)}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('cheques')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'cheques'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          <span>چک‌های صیادی</span>
          <span
            className={`text-[10px] px-1.5 py-0.5 rounded-full ${
              activeTab === 'cheques' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-800'
            }`}
          >
            {toPersianDigits(cheques.length)}
          </span>
        </button>
      </div>

      {/* Tab 1: Debts and Credits */}
      {activeTab === 'debts' && (
        <div className="space-y-6">
          {/* Summary stats (Collapsible) */}
          <CollapsibleSection
            storageKey="debts_summary_kpi"
            title="خلاصه طلب‌ها و بدهی‌های جاری"
            subtitle="مجموع تعهدات تسویه‌نشده مالی شما"
            icon={<Scale className="w-5 h-5 text-indigo-500" />}
            defaultExpanded={true}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-800/30 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500">
                    مجموع طلب‌های وصول‌نشده (دارایی شما)
                  </span>
                  <h4 className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-1 font-mono">
                    {formatCurrency(totalCredits, currency)}
                  </h4>
                </div>
                <ArrowDownLeft className="w-8 h-8 text-emerald-500/30" />
              </div>

              <div className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/50 dark:border-rose-800/30 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500">
                    مجموع بدهی‌های پرداخت‌نشده (تعهد شما)
                  </span>
                  <h4 className="text-lg font-black text-rose-600 dark:text-rose-400 mt-1 font-mono">
                    {formatCurrency(totalDebts, currency)}
                  </h4>
                </div>
                <ArrowUpRight className="w-8 h-8 text-rose-500/30" />
              </div>
            </div>
          </CollapsibleSection>

          {/* List of Debts (Collapsible) */}
          <CollapsibleSection
            storageKey="debts_list_items"
            title="فهرست بدهی‌ها و طلب‌ها"
            subtitle={`${toPersianDigits(debts.length)} پرونده ثبت‌شده`}
            icon={<Users className="w-5 h-5 text-indigo-500" />}
            defaultExpanded={true}
          >
            <div className="space-y-3 pt-1">
              {debts.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  هیچ بدهی یا طلبی ثبت نشده است.
                </div>
              ) : (
                debts.map(item => {
                  const remaining = Math.max(0, item.amount - item.paidAmount);
                  const percent = Math.min(
                    100,
                    Math.round((item.paidAmount / item.amount) * 100)
                  );
                  const isExpanded = expandedDebtId === item.id;
                  const hasPayments = item.payments && item.payments.length > 0;

                  const categoryLabel =
                    item.category === 'loan'
                      ? 'وام بانکی'
                      : item.category === 'installment'
                      ? 'خرید قسطی'
                      : item.category === 'other'
                      ? 'سایر'
                      : 'قرض شخصی';

                  return (
                    <div
                      key={item.id}
                      className={`p-4 sm:p-5 rounded-2xl liquid-glass border border-slate-200/50 dark:border-white/10 flex flex-col gap-4 transition ${
                        item.isSettled ? 'opacity-70 bg-slate-50/50 dark:bg-slate-900/40' : ''
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-3.5">
                          <div
                            className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 text-white shadow-sm ${
                              item.type === 'credit' ? 'bg-emerald-600' : 'bg-rose-600'
                            }`}
                          >
                            {item.type === 'credit' ? (
                              <ArrowDownLeft className="w-5 h-5" />
                            ) : (
                              <ArrowUpRight className="w-5 h-5" />
                            )}
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                                {item.personName}
                              </h4>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  item.isSettled
                                    ? 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                                    : item.type === 'credit'
                                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50'
                                    : 'bg-rose-50 text-rose-700 dark:bg-rose-950/50'
                                }`}
                              >
                                {item.isSettled
                                  ? 'تسویه شده'
                                  : item.type === 'credit'
                                  ? 'طلب من'
                                  : 'بدهی من'}
                              </span>
                              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700">
                                {categoryLabel}
                              </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
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
                                  <span className="truncate max-w-[200px]">{item.description}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-slate-100 dark:border-slate-800">
                          <div className="text-right sm:text-left">
                            <div className="text-xs text-slate-400">
                              مبلغ کل: {formatCurrency(item.amount, currency)}
                            </div>
                            <div
                              className={`text-sm font-black font-mono ${
                                item.isSettled
                                  ? 'text-slate-400 line-through'
                                  : item.type === 'credit'
                                  ? 'text-emerald-600 dark:text-emerald-400'
                                  : 'text-rose-600 dark:text-rose-400'
                              }`}
                            >
                              مانده: {formatCurrency(remaining, currency)}
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {!item.isSettled && (
                              <button
                                onClick={() => setPayingDebt(item)}
                                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-sm"
                              >
                                ثبت تسویه / قسط
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setEditingDebt(item);
                                setIsDebtModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 transition"
                              title="ویرایش"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteDebt(item.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 transition"
                              title="حذف"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                          <span>پرداخت شده: {formatCurrency(item.paidAmount, currency)} ({toPersianDigits(percent)}٪)</span>
                          {hasPayments && (
                            <button
                              type="button"
                              onClick={() => setExpandedDebtId(isExpanded ? null : item.id)}
                              className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline font-bold"
                            >
                              <span>تاریخچه پرداخت‌ها ({toPersianDigits(item.payments!.length)})</span>
                              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>
                          )}
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 rounded-full ${
                              item.isSettled
                                ? 'bg-emerald-500'
                                : item.type === 'credit'
                                ? 'bg-emerald-500'
                                : 'bg-rose-500'
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>

                      {/* Installments / Payment History Accordion */}
                      {isExpanded && hasPayments && (
                        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
                          <div className="text-[11px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-indigo-500" />
                            <span>ریز واریزی‌ها و اقساط ثبت‌شده:</span>
                          </div>
                          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                            {item.payments!.map(pay => (
                              <div
                                key={pay.id}
                                className="flex items-center justify-between p-2 rounded-xl bg-slate-50/70 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 text-xs"
                              >
                                <div className="space-y-0.5">
                                  <div className="font-bold text-slate-800 dark:text-slate-200">
                                    {formatCurrency(pay.amount, currency)}
                                  </div>
                                  <div className="text-[10px] text-slate-400 flex items-center gap-2">
                                    <span>تاریخ: {toPersianDigits(pay.date)}</span>
                                    {pay.accountName && (
                                      <>
                                        <span>•</span>
                                        <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                                          حساب: {pay.accountName}
                                        </span>
                                      </>
                                    )}
                                  </div>
                                </div>
                                {pay.description && (
                                  <div className="text-[11px] text-slate-500 dark:text-slate-400 max-w-[140px] truncate">
                                    {pay.description}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </CollapsibleSection>
        </div>
      )}

      {/* Tab 2: Cheques */}
      {activeTab === 'cheques' && (
        <div className="space-y-6">
          {/* Summary stats (Collapsible) */}
          <CollapsibleSection
            storageKey="cheques_summary_kpi"
            title="خلاصه چک‌های صیادی در جریان"
            subtitle="مجموع مبالغ چک‌های دریافتی و پرداختی پاس‌نشده"
            icon={<Clock className="w-5 h-5 text-indigo-500" />}
            defaultExpanded={true}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/50 dark:border-indigo-800/30 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500">مجموع چک‌های در جریان دریافتی</span>
                  <h4 className="text-lg font-black text-indigo-600 dark:text-indigo-400 mt-1 font-mono">
                    {formatCurrency(totalPendingChequesReceivable, currency)}
                  </h4>
                </div>
                <Clock className="w-8 h-8 text-indigo-500/30" />
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/30 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500">مجموع چک‌های در جریان پرداختی</span>
                  <h4 className="text-lg font-black text-amber-600 dark:text-amber-400 mt-1 font-mono">
                    {formatCurrency(totalPendingChequesPayable, currency)}
                  </h4>
                </div>
                <FileCheck2 className="w-8 h-8 text-amber-500/30" />
              </div>
            </div>
          </CollapsibleSection>

          {/* Cheque List (Collapsible) */}
          <CollapsibleSection
            storageKey="cheques_list_items"
            title="فهرست چک‌های صیادی"
            subtitle={`${toPersianDigits(cheques.length)} فقره چک ثبت‌شده`}
            icon={<FileCheck2 className="w-5 h-5 text-indigo-500" />}
            defaultExpanded={true}
          >
            <div className="space-y-3 pt-1">
              {cheques.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  هیچ چکی ثبت نشده است.
                </div>
              ) : (
                cheques.map(cheque => (
                  <div
                    key={cheque.id}
                    className="p-4 sm:p-5 rounded-2xl liquid-glass border border-slate-200/50 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
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
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                : cheque.status === 'bounced'
                                ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
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
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-slate-100 dark:border-slate-800">
                      <div className="text-right sm:text-left">
                        <div className="text-sm sm:text-base font-black text-slate-900 dark:text-white font-mono">
                          {formatCurrency(cheque.amount, currency)}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {cheque.status === 'pending' && (
                          <button
                            onClick={() => changeChequeStatus(cheque.id, 'passed')}
                            className="px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/80 text-emerald-700 dark:text-emerald-300 text-xs font-bold transition flex items-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>پاس شد</span>
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setEditingCheque(cheque);
                            setIsChequeModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 transition"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCheque(cheque.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CollapsibleSection>
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

      {/* Pay Debt Modal */}
      <PayDebtModal
        isOpen={!!payingDebt}
        onClose={() => setPayingDebt(null)}
        debt={payingDebt}
      />

      {/* Person Manager Modal */}
      <PersonManagerModal
        isOpen={isPersonModalOpen}
        onClose={() => setIsPersonModalOpen(false)}
      />
    </div>
  );
};

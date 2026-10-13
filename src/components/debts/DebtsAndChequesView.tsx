import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Debt, Cheque } from '../../types';
import { formatCurrency, toPersianDigits } from '../../utils/formatters';
import { getTodayJalali, jalaliToGregorian, normalizeJalaliDate } from '../../utils/jalali';
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
  Clock,
  Phone,
  ArrowUpRight,
  ArrowDownLeft,
  Check,
  Scale,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  RotateCcw,
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

  const [activeTab, setActiveTab] = useState<'debts' | 'credits' | 'cheques'>('debts');

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
    .filter((d) => d.type === 'credit' && !d.isSettled)
    .reduce((sum, d) => sum + (d.amount - d.paidAmount), 0);

  const totalDebts = debts
    .filter((d) => d.type === 'debt' && !d.isSettled)
    .reduce((sum, d) => sum + (d.amount - d.paidAmount), 0);

  const totalPendingChequesReceivable = cheques
    .filter((c) => c.type === 'receivable' && c.status === 'pending')
    .reduce((sum, c) => sum + c.amount, 0);

  const totalPendingChequesPayable = cheques
    .filter((c) => c.type === 'payable' && c.status === 'pending')
    .reduce((sum, c) => sum + c.amount, 0);

  const debtsList = debts.filter((d) => d.type === 'debt');
  const creditsList = debts.filter((d) => d.type === 'credit');

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

  // Helper to calculate due status badge
  const getDueStatus = (dueDate: string) => {
    const cleanDue = normalizeJalaliDate(dueDate);
    const today = getTodayJalali();
    if (!cleanDue) return null;

    if (cleanDue < today) {
      return { label: 'سررسید گذشته', type: 'overdue' as const };
    }
    if (cleanDue === today) {
      return { label: 'سررسید امروز', type: 'today' as const };
    }

    try {
      const parts = cleanDue.split('/');
      const jy = parseInt(parts[0], 10);
      const jm = parseInt(parts[1], 10);
      const jd = parseInt(parts[2], 10);
      const [gy, gm, gd] = jalaliToGregorian(jy, jm, jd);
      const targetDate = new Date(gy, gm - 1, gd);
      const now = new Date();
      const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const diffMs = targetDate.getTime() - todayDate.getTime();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays <= 7) {
        return { label: `${toPersianDigits(diffDays)} روز تا سررسید (نزدیک)`, type: 'soon' as const };
      }
      return { label: `${toPersianDigits(diffDays)} روز مانده`, type: 'normal' as const };
    } catch {
      return null;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#1F2933] dark:text-[#F7F7F2]">
            مدیریت بدهی، طلب، اقساط و چک‌ها
          </h2>
          <p className="text-xs text-[#6B7280] dark:text-[#D1D5DB]/70">
            ردگیری سررسید تسویه‌ها و پیشگیری از فراموشی چک‌ها و موعد پرداخت‌ها
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <button
            onClick={() => setIsPersonModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#F7F7F2]/90 dark:bg-[#1F2933]/60 border border-[#6B7280]/20 dark:border-[#D1D5DB]/15 text-[#1F2933] dark:text-[#D1D5DB] text-xs font-bold hover:border-[#A68A64]/40 transition shadow-xs"
            title="مدیریت اشخاص و طرف‌حساب‌ها"
          >
            <Users className="w-4 h-4 text-[#A68A64]" />
            <span className="whitespace-nowrap">مدیریت طرف‌حساب‌ها</span>
          </button>

          {activeTab === 'cheques' ? (
            <button
              onClick={() => {
                setEditingCheque(null);
                setIsChequeModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#A68A64] hover:bg-[#8A704C] text-[#F7F7F2] text-xs font-black shadow-md shadow-[#A68A64]/20 transition active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span className="whitespace-nowrap">ثبت چک صیادی</span>
            </button>
          ) : (
            <button
              onClick={() => {
                setEditingDebt(null);
                setIsDebtModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#A68A64] hover:bg-[#8A704C] text-[#F7F7F2] text-xs font-black shadow-md shadow-[#A68A64]/20 transition active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span className="whitespace-nowrap">
                {activeTab === 'credits' ? 'ثبت طلب جدید' : 'ثبت بدهی جدید'}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Nordic Segmented Tab Bar */}
      <div className="flex gap-2 p-1.5 bg-[#F7F7F2]/90 dark:bg-[#1F2933]/60 rounded-2xl w-fit border border-[#6B7280]/15 dark:border-[#D1D5DB]/10 shadow-xs">
        <button
          onClick={() => setActiveTab('debts')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'debts'
              ? 'bg-[#A68A64] text-[#F7F7F2] shadow-md shadow-[#A68A64]/20'
              : 'text-[#6B7280] dark:text-[#D1D5DB]/70 hover:text-[#1F2933] dark:hover:text-[#F7F7F2]'
          }`}
        >
          <ArrowUpRight className="w-4 h-4" />
          <span>بدهی‌های من</span>
          <span
            className={`text-[10px] font-mono tabular-nums px-1.5 py-0.5 rounded-full ${
              activeTab === 'debts'
                ? 'bg-white/20 text-[#F7F7F2]'
                : 'bg-[#6B7280]/15 dark:bg-[#D1D5DB]/15 text-[#6B7280] dark:text-[#D1D5DB]'
            }`}
          >
            {toPersianDigits(debtsList.length)}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('credits')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'credits'
              ? 'bg-[#A68A64] text-[#F7F7F2] shadow-md shadow-[#A68A64]/20'
              : 'text-[#6B7280] dark:text-[#D1D5DB]/70 hover:text-[#1F2933] dark:hover:text-[#F7F7F2]'
          }`}
        >
          <ArrowDownLeft className="w-4 h-4" />
          <span>طلب‌های من</span>
          <span
            className={`text-[10px] font-mono tabular-nums px-1.5 py-0.5 rounded-full ${
              activeTab === 'credits'
                ? 'bg-white/20 text-[#F7F7F2]'
                : 'bg-[#6B7280]/15 dark:bg-[#D1D5DB]/15 text-[#6B7280] dark:text-[#D1D5DB]'
            }`}
          >
            {toPersianDigits(creditsList.length)}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('cheques')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'cheques'
              ? 'bg-[#A68A64] text-[#F7F7F2] shadow-md shadow-[#A68A64]/20'
              : 'text-[#6B7280] dark:text-[#D1D5DB]/70 hover:text-[#1F2933] dark:hover:text-[#F7F7F2]'
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          <span>چک‌های صیادی</span>
          <span
            className={`text-[10px] font-mono tabular-nums px-1.5 py-0.5 rounded-full ${
              activeTab === 'cheques'
                ? 'bg-white/20 text-[#F7F7F2]'
                : 'bg-[#6B7280]/15 dark:bg-[#D1D5DB]/15 text-[#6B7280] dark:text-[#D1D5DB]'
            }`}
          >
            {toPersianDigits(cheques.length)}
          </span>
        </button>
      </div>

      {/* Summary KPI Banner (Collapsible) */}
      <CollapsibleSection
        storageKey="debts_summary_kpi"
        title="خلاصه وضعیت تعهدات و چک‌های در جریان"
        subtitle="مجموع تعهدات تسویه‌نشده، مطالبات و چک‌های صیادی"
        icon={<Scale className="w-5 h-5 text-[#A68A64]" />}
        defaultExpanded={true}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
          {/* Card 1: Debts */}
          <div className="p-4 rounded-2xl bg-[#C0564B]/10 border border-[#C0564B]/20 flex items-center justify-between">
            <div>
              <span className="text-xs text-[#6B7280] dark:text-[#D1D5DB]/70">
                مجموع بدهی‌های پرداخت‌نشده
              </span>
              <h4 className="text-lg font-black text-[#C0564B] dark:text-[#F87171] mt-1 font-mono tabular-nums">
                {formatCurrency(totalDebts, currency)}
              </h4>
            </div>
            <ArrowUpRight className="w-8 h-8 text-[#C0564B]/30" />
          </div>

          {/* Card 2: Credits */}
          <div className="p-4 rounded-2xl bg-[#2E7D5B]/10 border border-[#2E7D5B]/20 flex items-center justify-between">
            <div>
              <span className="text-xs text-[#6B7280] dark:text-[#D1D5DB]/70">
                مجموع طلب‌های وصول‌نشده
              </span>
              <h4 className="text-lg font-black text-[#2E7D5B] dark:text-[#4ADE80] mt-1 font-mono tabular-nums">
                {formatCurrency(totalCredits, currency)}
              </h4>
            </div>
            <ArrowDownLeft className="w-8 h-8 text-[#2E7D5B]/30" />
          </div>

          {/* Card 3: Pending Cheques Receivable */}
          <div className="p-4 rounded-2xl bg-[#4A6FA5]/10 border border-[#4A6FA5]/20 flex items-center justify-between">
            <div>
              <span className="text-xs text-[#6B7280] dark:text-[#D1D5DB]/70">
                چک‌های دریافتی در جریان
              </span>
              <h4 className="text-lg font-black text-[#4A6FA5] dark:text-[#60A5FA] mt-1 font-mono tabular-nums">
                {formatCurrency(totalPendingChequesReceivable, currency)}
              </h4>
            </div>
            <Clock className="w-8 h-8 text-[#4A6FA5]/30" />
          </div>

          {/* Card 4: Pending Cheques Payable */}
          <div className="p-4 rounded-2xl bg-[#A68A64]/10 border border-[#A68A64]/20 flex items-center justify-between">
            <div>
              <span className="text-xs text-[#6B7280] dark:text-[#D1D5DB]/70">
                چک‌های پرداختی در جریان
              </span>
              <h4 className="text-lg font-black text-[#A68A64] mt-1 font-mono tabular-nums">
                {formatCurrency(totalPendingChequesPayable, currency)}
              </h4>
            </div>
            <FileCheck2 className="w-8 h-8 text-[#A68A64]/30" />
          </div>
        </div>
      </CollapsibleSection>

      {/* Tab 1 & 2: Debts and Receivables List */}
      {(activeTab === 'debts' || activeTab === 'credits') && (
        <div className="space-y-4">
          <CollapsibleSection
            storageKey={`list_${activeTab}`}
            title={activeTab === 'debts' ? 'فهرست بدهی‌ها و تعهدات مالی' : 'فهرست طلب‌ها و مطالبات مالی'}
            subtitle={`${toPersianDigits((activeTab === 'debts' ? debtsList : creditsList).length)} پرونده ثبت‌شده`}
            icon={activeTab === 'debts' ? <ArrowUpRight className="w-5 h-5 text-[#C0564B]" /> : <ArrowDownLeft className="w-5 h-5 text-[#2E7D5B]" />}
            defaultExpanded={true}
          >
            <div className="space-y-3 pt-1">
              {(activeTab === 'debts' ? debtsList : creditsList).length === 0 ? (
                <div className="text-center py-12 text-[#6B7280] text-xs">
                  {activeTab === 'debts'
                    ? 'هیچ بدهی ثبت‌شده‌ای وجود ندارد.'
                    : 'هیچ طلب ثبت‌شده‌ای وجود ندارد.'}
                </div>
              ) : (
                (activeTab === 'debts' ? debtsList : creditsList).map((item) => {
                  const remaining = Math.max(0, item.amount - item.paidAmount);
                  const percent = Math.min(
                    100,
                    Math.round((item.paidAmount / item.amount) * 100)
                  );
                  const isExpanded = expandedDebtId === item.id;
                  const hasPayments = item.payments && item.payments.length > 0;
                  const dueInfo = getDueStatus(item.dueDate);

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
                      className={`p-4 sm:p-5 rounded-2xl bg-[#F7F7F2]/90 dark:bg-[#1F2933]/60 border border-[#6B7280]/15 dark:border-[#D1D5DB]/10 flex flex-col gap-4 transition hover:border-[#A68A64]/30 shadow-xs ${
                        item.isSettled ? 'opacity-70 bg-[#6B7280]/5 dark:bg-[#1F2933]/30' : ''
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-3.5">
                          <div
                            className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 text-white shadow-xs ${
                              item.type === 'credit'
                                ? 'bg-[#2E7D5B]'
                                : 'bg-[#C0564B]'
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
                              <h4 className="text-sm font-bold text-[#1F2933] dark:text-[#F7F7F2]">
                                {item.personName}
                              </h4>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  item.isSettled
                                    ? 'bg-[#6B7280]/15 text-[#6B7280] dark:text-[#D1D5DB]'
                                    : item.type === 'credit'
                                    ? 'bg-[#2E7D5B]/15 text-[#2E7D5B] dark:text-[#4ADE80] border border-[#2E7D5B]/20'
                                    : 'bg-[#C0564B]/15 text-[#C0564B] dark:text-[#F87171] border border-[#C0564B]/20'
                                }`}
                              >
                                {item.isSettled
                                  ? 'تسویه شده'
                                  : item.type === 'credit'
                                  ? 'طلب من'
                                  : 'بدهی من'}
                              </span>
                              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#6B7280]/10 dark:bg-[#D1D5DB]/10 text-[#6B7280] dark:text-[#D1D5DB]">
                                {categoryLabel}
                              </span>

                              {/* Due Date Status Badge */}
                              {dueInfo && !item.isSettled && (
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                                    dueInfo.type === 'overdue'
                                      ? 'bg-[#C0564B]/15 text-[#C0564B] dark:text-[#F87171] border border-[#C0564B]/25'
                                      : dueInfo.type === 'today' || dueInfo.type === 'soon'
                                      ? 'bg-[#A68A64]/15 text-[#A68A64] border border-[#A68A64]/25'
                                      : 'bg-[#6B7280]/10 text-[#6B7280] dark:text-[#D1D5DB]'
                                  }`}
                                >
                                  {dueInfo.type === 'overdue' && <AlertTriangle className="w-3 h-3" />}
                                  {dueInfo.type === 'soon' && <Clock className="w-3 h-3" />}
                                  <span>{dueInfo.label}</span>
                                </span>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-2 text-xs text-[#6B7280]">
                              <span>موعد سررسید: {toPersianDigits(item.dueDate)}</span>
                              {item.phoneNumber && (
                                <>
                                  <span>•</span>
                                  <span className="flex items-center gap-1 dir-ltr">
                                    <Phone className="w-3 h-3 text-[#6B7280]" />
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

                        <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-[#6B7280]/15 dark:border-[#D1D5DB]/10">
                          <div className="text-right sm:text-left">
                            <div className="text-xs text-[#6B7280]">
                              مبلغ کل: {formatCurrency(item.amount, currency)}
                            </div>
                            <div
                              className={`text-sm font-black font-mono tabular-nums ${
                                item.isSettled
                                  ? 'text-[#6B7280] line-through'
                                  : item.type === 'credit'
                                  ? 'text-[#2E7D5B] dark:text-[#4ADE80]'
                                  : 'text-[#C0564B] dark:text-[#F87171]'
                              }`}
                            >
                              مانده: {formatCurrency(remaining, currency)}
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {!item.isSettled && (
                              <button
                                onClick={() => setPayingDebt(item)}
                                className="px-3.5 py-1.5 rounded-xl bg-[#A68A64] hover:bg-[#8A704C] text-[#F7F7F2] text-xs font-bold transition shadow-xs active:scale-95"
                              >
                                تسویه / پرداخت قسط
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setEditingDebt(item);
                                setIsDebtModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-[#6B7280] hover:text-[#A68A64] transition"
                              title="ویرایش"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteDebt(item.id)}
                              className="p-1.5 rounded-lg text-[#6B7280] hover:text-[#C0564B] transition"
                              title="حذف"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px] text-[#6B7280] dark:text-[#D1D5DB]/70">
                          <span>
                            پرداخت شده: {formatCurrency(item.paidAmount, currency)} ({toPersianDigits(percent)}٪)
                          </span>
                          {hasPayments && (
                            <button
                              type="button"
                              onClick={() => setExpandedDebtId(isExpanded ? null : item.id)}
                              className="flex items-center gap-1 text-[#A68A64] hover:underline font-bold"
                            >
                              <span>تاریخچه پرداخت‌ها ({toPersianDigits(item.payments!.length)})</span>
                              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>
                          )}
                        </div>
                        <div className="h-2 w-full bg-[#6B7280]/15 dark:bg-[#D1D5DB]/15 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 rounded-full ${
                              item.isSettled
                                ? 'bg-[#2E7D5B]'
                                : item.type === 'credit'
                                ? 'bg-[#2E7D5B]'
                                : 'bg-[#A68A64]'
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>

                      {/* Installments / Payment History Accordion */}
                      {isExpanded && hasPayments && (
                        <div className="pt-3 border-t border-[#6B7280]/15 dark:border-[#D1D5DB]/10 space-y-2">
                          <div className="text-[11px] font-bold text-[#1F2933] dark:text-[#D1D5DB] flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-[#A68A64]" />
                            <span>ریز واریزی‌ها و اقساط ثبت‌شده:</span>
                          </div>
                          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                            {item.payments!.map((pay) => (
                              <div
                                key={pay.id}
                                className="flex items-center justify-between p-2 rounded-xl bg-[#F7F7F2] dark:bg-[#141B22]/70 border border-[#6B7280]/15 dark:border-[#D1D5DB]/10 text-xs"
                              >
                                <div className="space-y-0.5">
                                  <div className="font-bold font-mono tabular-nums text-[#1F2933] dark:text-[#F7F7F2]">
                                    {formatCurrency(pay.amount, currency)}
                                  </div>
                                  <div className="text-[10px] text-[#6B7280] flex items-center gap-2">
                                    <span>تاریخ: {toPersianDigits(pay.date)}</span>
                                    {pay.accountName && (
                                      <>
                                        <span>•</span>
                                        <span className="text-[#A68A64] font-medium">
                                          حساب: {pay.accountName}
                                        </span>
                                      </>
                                    )}
                                  </div>
                                </div>
                                {pay.description && (
                                  <div className="text-[11px] text-[#6B7280] max-w-[140px] truncate">
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

      {/* Tab 3: Cheques List */}
      {activeTab === 'cheques' && (
        <div className="space-y-4">
          <CollapsibleSection
            storageKey="cheques_list_items"
            title="فهرست چک‌های صیادی"
            subtitle={`${toPersianDigits(cheques.length)} فقره چک ثبت‌شده`}
            icon={<FileCheck2 className="w-5 h-5 text-[#A68A64]" />}
            defaultExpanded={true}
          >
            <div className="space-y-3 pt-1">
              {cheques.length === 0 ? (
                <div className="text-center py-12 text-[#6B7280] text-xs">
                  هیچ چکی ثبت نشده است.
                </div>
              ) : (
                cheques.map((cheque) => {
                  const dueInfo = getDueStatus(cheque.dueDate);

                  return (
                    <div
                      key={cheque.id}
                      className="p-4 sm:p-5 rounded-2xl bg-[#F7F7F2]/90 dark:bg-[#1F2933]/60 border border-[#6B7280]/15 dark:border-[#D1D5DB]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition hover:border-[#A68A64]/30 shadow-xs"
                    >
                      <div className="flex items-start gap-3.5">
                        <div
                          className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 text-white shadow-xs ${
                            cheque.status === 'passed' || cheque.status === 'cleared'
                              ? 'bg-[#2E7D5B]'
                              : cheque.status === 'bounced'
                              ? 'bg-[#C0564B]'
                              : 'bg-[#A68A64]'
                          }`}
                        >
                          <FileCheck2 className="w-5 h-5" />
                        </div>

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-bold text-[#1F2933] dark:text-[#F7F7F2]">
                              {cheque.partyName}
                            </h4>

                            {/* Cheque Type */}
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                cheque.type === 'receivable'
                                  ? 'bg-[#2E7D5B]/15 text-[#2E7D5B] dark:text-[#4ADE80] border border-[#2E7D5B]/20'
                                  : 'bg-[#C0564B]/15 text-[#C0564B] dark:text-[#F87171] border border-[#C0564B]/20'
                              }`}
                            >
                              {cheque.type === 'receivable' ? 'چک دریافتی' : 'چک پرداختی (صادرشده)'}
                            </span>

                            {/* Status Badge */}
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                cheque.status === 'passed' || cheque.status === 'cleared'
                                  ? 'bg-[#2E7D5B]/20 text-[#2E7D5B] dark:text-[#4ADE80]'
                                  : cheque.status === 'bounced'
                                  ? 'bg-[#C0564B]/20 text-[#C0564B] dark:text-[#F87171]'
                                  : 'bg-[#A68A64]/20 text-[#A68A64]'
                              }`}
                            >
                              {cheque.status === 'passed' || cheque.status === 'cleared'
                                ? 'پاس شده'
                                : cheque.status === 'bounced'
                                ? 'برگشتی'
                                : 'در انتظار'}
                            </span>

                            {/* Due Countdown Badge */}
                            {dueInfo && cheque.status === 'pending' && (
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                                  dueInfo.type === 'overdue'
                                    ? 'bg-[#C0564B]/15 text-[#C0564B] dark:text-[#F87171] border border-[#C0564B]/25'
                                    : dueInfo.type === 'today' || dueInfo.type === 'soon'
                                    ? 'bg-[#A68A64]/15 text-[#A68A64] border border-[#A68A64]/25'
                                    : 'bg-[#6B7280]/10 text-[#6B7280] dark:text-[#D1D5DB]'
                                }`}
                              >
                                {dueInfo.type === 'overdue' && <AlertTriangle className="w-3 h-3" />}
                                {dueInfo.type === 'soon' && <Clock className="w-3 h-3" />}
                                <span>{dueInfo.label}</span>
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-2 text-xs text-[#6B7280] mt-1">
                            <span>سررسید: {toPersianDigits(cheque.dueDate)}</span>
                            <span>•</span>
                            <span>بانک: {cheque.bankName}</span>
                            <span>•</span>
                            <span>سریال: {toPersianDigits(cheque.chequeNumber)}</span>
                            {cheque.sayadNumber && (
                              <>
                                <span>•</span>
                                <span className="font-mono text-[11px] dir-ltr text-[#A68A64]">
                                  صیاد: {toPersianDigits(cheque.sayadNumber)}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-[#6B7280]/15 dark:border-[#D1D5DB]/10">
                        <div className="text-right sm:text-left">
                          <div className="text-sm sm:text-base font-black text-[#1F2933] dark:text-[#F7F7F2] font-mono tabular-nums">
                            {formatCurrency(cheque.amount, currency)}
                          </div>
                        </div>

                        {/* Quick Status Actions */}
                        <div className="flex items-center gap-1.5">
                          {cheque.status === 'pending' && (
                            <>
                              <button
                                onClick={() => changeChequeStatus(cheque.id, 'passed')}
                                className="px-2.5 py-1.5 rounded-xl bg-[#2E7D5B]/15 hover:bg-[#2E7D5B]/25 text-[#2E7D5B] dark:text-[#4ADE80] text-xs font-bold transition flex items-center gap-1"
                                title="ثبت به عنوان پاس شده"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>پاس شد</span>
                              </button>
                              <button
                                onClick={() => changeChequeStatus(cheque.id, 'bounced')}
                                className="px-2.5 py-1.5 rounded-xl bg-[#C0564B]/15 hover:bg-[#C0564B]/25 text-[#C0564B] dark:text-[#F87171] text-xs font-bold transition flex items-center gap-1"
                                title="ثبت به عنوان برگشتی"
                              >
                                <AlertTriangle className="w-3.5 h-3.5" />
                                <span>برگشت</span>
                              </button>
                            </>
                          )}

                          {(cheque.status === 'passed' || cheque.status === 'cleared' || cheque.status === 'bounced') && (
                            <button
                              onClick={() => changeChequeStatus(cheque.id, 'pending')}
                              className="px-2.5 py-1.5 rounded-xl bg-[#A68A64]/15 hover:bg-[#A68A64]/25 text-[#A68A64] text-xs font-bold transition flex items-center gap-1"
                              title="بازگشت به وضعیت در انتظار"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>در انتظار</span>
                            </button>
                          )}

                          <button
                            onClick={() => {
                              setEditingCheque(cheque);
                              setIsChequeModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-[#6B7280] hover:text-[#A68A64] transition"
                            title="ویرایش چک"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCheque(cheque.id)}
                            className="p-1.5 rounded-lg text-[#6B7280] hover:text-[#C0564B] transition"
                            title="حذف چک"
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

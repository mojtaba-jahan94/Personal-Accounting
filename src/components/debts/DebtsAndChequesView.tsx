import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFinance } from '../../context/FinanceContext';
import { Debt, Cheque } from '../../types';
import { formatCurrency, toPersianDigits } from '../../utils/formatters';
import { getTodayJalali, jalaliToGregorian, normalizeJalaliDate } from '../../utils/jalali';
import { DebtModal } from './DebtModal';
import { ChequeModal } from './ChequeModal';
import { PayDebtModal } from './PayDebtModal';
import { PersonManagerModal } from '../contacts/PersonManagerModal';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { IconButton } from '../ui/IconButton';
import { ProgressBar } from '../ui/ProgressBar';
import { Badge } from '../ui/Badge';
import { EmptyState } from '../ui/EmptyState';
import { AnimatedNumber } from '../ui/AnimatedNumber';
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
        return { label: `${toPersianDigits(diffDays)} روز تا سررسید`, type: 'soon' as const };
      }
      return { label: `${toPersianDigits(diffDays)} روز مانده`, type: 'normal' as const };
    } catch {
      return null;
    }
  };

  return (
    <div className="space-y-8 pb-20 select-none">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
            <span className="text-[11px] font-mono font-bold tracking-wider text-violet-400 uppercase">
              OBLIGATIONS & CHEQUES
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-fintech-text-primary tracking-tight">
            بدهی‌ها، طلب‌ها و چک‌ها
          </h1>
          <p className="text-xs text-fintech-text-muted mt-1">
            مدیریت هوشمند تعهدات مالی، مطالبات از افراد، اقساط و موعد سررسید چک‌های صیادی
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="secondary"
            onClick={() => setIsPersonModalOpen(true)}
            icon={<Users className="w-4 h-4 text-violet-400" />}
          >
            مدیریت طرف‌حساب‌ها
          </Button>

          {activeTab === 'cheques' ? (
            <Button
              variant="primary"
              onClick={() => {
                setEditingCheque(null);
                setIsChequeModalOpen(true);
              }}
              icon={<Plus className="w-4 h-4 stroke-[2.5]" />}
            >
              ثبت چک صیادی
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={() => {
                setEditingDebt(null);
                setIsDebtModalOpen(true);
              }}
              icon={<Plus className="w-4 h-4 stroke-[2.5]" />}
            >
              {activeTab === 'credits' ? 'ثبت طلب جدید' : 'ثبت بدهی جدید'}
            </Button>
          )}
        </div>
      </div>

      {/* 2. KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <Card variant="glass" className="p-4 border-rose-500/20">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
              <ArrowUpRight className="w-4 h-4" />
              بدهی‌های پرداخت‌نشده
            </span>
          </div>
          <div className="text-lg font-bold font-mono text-rose-400">
            <AnimatedNumber value={totalDebts} currency={currency} />
          </div>
        </Card>

        <Card variant="glass" className="p-4 border-emerald-500/20">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
              <ArrowDownLeft className="w-4 h-4" />
              طلب‌های وصول‌نشده
            </span>
          </div>
          <div className="text-lg font-bold font-mono text-emerald-400">
            <AnimatedNumber value={totalCredits} currency={currency} />
          </div>
        </Card>

        <Card variant="glass" className="p-4 border-cyan-500/20">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              چک‌های دریافتی در جریان
            </span>
          </div>
          <div className="text-lg font-bold font-mono text-cyan-400">
            <AnimatedNumber value={totalPendingChequesReceivable} currency={currency} />
          </div>
        </Card>

        <Card variant="glass" className="p-4 border-amber-500/20">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
              <FileCheck2 className="w-4 h-4" />
              چک‌های پرداختی در جریان
            </span>
          </div>
          <div className="text-lg font-bold font-mono text-amber-400">
            <AnimatedNumber value={totalPendingChequesPayable} currency={currency} />
          </div>
        </Card>
      </div>

      {/* 3. Segmented Navigation Tabs */}
      <div className="flex items-center gap-2 p-1 rounded-2xl bg-black/20 dark:bg-white/[0.04] border border-white/5 w-fit">
        {[
          { id: 'debts', label: 'بدهی‌های من', icon: ArrowUpRight, count: debtsList.length },
          { id: 'credits', label: 'طلب‌های من', icon: ArrowDownLeft, count: creditsList.length },
          { id: 'cheques', label: 'چک‌های صیادی', icon: FileCheck2, count: cheques.length },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                isActive ? 'text-white' : 'text-fintech-text-muted hover:text-fintech-text-primary'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="debtActiveTabPill"
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 shadow-md shadow-violet-500/25 -z-10"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              <span className="text-[10px] font-mono opacity-80">({toPersianDigits(tab.count)})</span>
            </button>
          );
        })}
      </div>

      {/* 4. Tab Content */}
      <AnimatePresence mode="wait">
        {(activeTab === 'debts' || activeTab === 'credits') && (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {(activeTab === 'debts' ? debtsList : creditsList).length === 0 ? (
              <Card variant="glass" className="py-14">
                <EmptyState
                  icon={Scale}
                  title={activeTab === 'debts' ? 'هیچ بدهی فعالی ندارید' : 'هیچ طلبی فعالی ندارید'}
                  description={
                    activeTab === 'debts'
                      ? 'تمامی تعهدات تسویه شده یا هنوز موردی ثبت نشده است.'
                      : 'تمامی مطالبات وصول شده یا موردی ثبت نشده است.'
                  }
                  actionLabel={activeTab === 'debts' ? 'ثبت بدهی جدید' : 'ثبت طلب جدید'}
                  onAction={() => {
                    setEditingDebt(null);
                    setIsDebtModalOpen(true);
                  }}
                />
              </Card>
            ) : (
              <div className="space-y-3.5">
                {(activeTab === 'debts' ? debtsList : creditsList).map((item, idx) => {
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
                      ? 'خرید اقساطی'
                      : item.category === 'other'
                      ? 'سایر'
                      : 'قرض شخصی';

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.15, delay: idx * 0.03 }}
                    >
                      <Card
                        variant="glass"
                        hoverLift={true}
                        className={`p-4 sm:p-5 space-y-4 ${
                          item.isSettled ? 'opacity-65' : ''
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-start gap-3.5">
                            <div
                              className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border border-white/10 ${
                                item.type === 'credit'
                                  ? 'bg-emerald-500/20 text-emerald-400'
                                  : 'bg-rose-500/20 text-rose-400'
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
                                <h3 className="text-sm font-bold text-white">
                                  {item.personName}
                                </h3>
                                <Badge
                                  variant={
                                    item.isSettled
                                      ? 'neutral'
                                      : item.type === 'credit'
                                      ? 'success'
                                      : 'danger'
                                  }
                                  size="sm"
                                >
                                  {item.isSettled
                                    ? 'تسویه شده'
                                    : item.type === 'credit'
                                    ? 'طلب من'
                                    : 'بدهی من'}
                                </Badge>
                                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/5 text-fintech-text-muted">
                                  {categoryLabel}
                                </span>

                                {dueInfo && !item.isSettled && (
                                  <Badge
                                    variant={
                                      dueInfo.type === 'overdue'
                                        ? 'danger'
                                        : dueInfo.type === 'soon'
                                        ? 'warning'
                                        : 'neutral'
                                    }
                                    size="sm"
                                  >
                                    {dueInfo.label}
                                  </Badge>
                                )}
                              </div>

                              <div className="flex flex-wrap items-center gap-2 text-xs text-fintech-text-muted font-mono">
                                <span>سررسید: {toPersianDigits(item.dueDate)}</span>
                                {item.phoneNumber && (
                                  <>
                                    <span>•</span>
                                    <span className="flex items-center gap-1 dir-ltr text-fintech-text-secondary">
                                      <Phone className="w-3 h-3 text-fintech-text-muted" />
                                      {toPersianDigits(item.phoneNumber)}
                                    </span>
                                  </>
                                )}
                                {item.description && (
                                  <>
                                    <span>•</span>
                                    <span className="truncate max-w-[200px] font-sans">{item.description}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-white/5">
                            <div className="text-right sm:text-left">
                              <div className="text-xs text-fintech-text-muted font-mono">
                                مبلغ کل: {formatCurrency(item.amount, currency)}
                              </div>
                              <div
                                className={`text-sm sm:text-base font-extrabold font-mono tabular-nums ${
                                  item.isSettled
                                    ? 'text-fintech-text-muted line-through'
                                    : item.type === 'credit'
                                    ? 'text-emerald-400'
                                    : 'text-rose-400'
                                }`}
                              >
                                مانده: {formatCurrency(remaining, currency)}
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5">
                              {!item.isSettled && (
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => setPayingDebt(item)}
                                >
                                  تسویه / قسط
                                </Button>
                              )}
                              <IconButton
                                variant="ghost"
                                size="sm"
                                icon={<Edit2 className="w-4 h-4" />}
                                onClick={() => {
                                  setEditingDebt(item);
                                  setIsDebtModalOpen(true);
                                }}
                                title="ویرایش"
                              />
                              <IconButton
                                variant="ghost"
                                size="sm"
                                icon={<Trash2 className="w-4 h-4 text-rose-400" />}
                                onClick={() => handleDeleteDebt(item.id)}
                                title="حذف"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px] text-fintech-text-muted">
                            <span>
                              پرداخت شده: {formatCurrency(item.paidAmount, currency)} ({toPersianDigits(percent)}٪)
                            </span>
                            {hasPayments && (
                              <button
                                type="button"
                                onClick={() => setExpandedDebtId(isExpanded ? null : item.id)}
                                className="flex items-center gap-1 text-violet-400 hover:text-violet-300 font-bold"
                              >
                                <span>تاریخچه پرداخت‌ها ({toPersianDigits(item.payments!.length)})</span>
                                {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                              </button>
                            )}
                          </div>
                          <ProgressBar
                            value={percent}
                            colorVariant={item.isSettled ? 'emerald' : item.type === 'credit' ? 'emerald' : 'violet'}
                            size="sm"
                            animated={true}
                          />
                        </div>

                        {/* Payment History Accordion */}
                        {isExpanded && hasPayments && (
                          <div className="pt-3 border-t border-white/5 space-y-2">
                            <div className="text-[11px] font-bold text-fintech-text-primary flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-violet-400" />
                              <span>ریز واریزی‌ها و اقساط ثبت‌شده:</span>
                            </div>
                            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                              {item.payments!.map((pay) => (
                                <div
                                  key={pay.id}
                                  className="flex items-center justify-between p-2 rounded-xl bg-black/20 dark:bg-white/[0.02] border border-white/5 text-xs"
                                >
                                  <div className="space-y-0.5">
                                    <div className="font-bold font-mono text-white">
                                      {formatCurrency(pay.amount, currency)}
                                    </div>
                                    <div className="text-[10px] text-fintech-text-muted flex items-center gap-2">
                                      <span>تاریخ: {toPersianDigits(pay.date)}</span>
                                      {pay.accountName && (
                                        <>
                                          <span>•</span>
                                          <span className="text-violet-400">حساب: {pay.accountName}</span>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                  {pay.description && (
                                    <div className="text-[11px] text-fintech-text-muted max-w-[140px] truncate">
                                      {pay.description}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* Tab 3: Cheques List */}
        {activeTab === 'cheques' && (
          <motion.div
            key="cheques"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-3.5"
          >
            {cheques.length === 0 ? (
              <Card variant="glass" className="py-14">
                <EmptyState
                  icon={FileCheck2}
                  title="هیچ چکی ثبت نشده است"
                  description="برای مدیریت چک‌های دریافتی یا صادرشده صیادی، اولین چک خود را اضافه نمایید."
                  actionLabel="ثبت چک صیادی"
                  onAction={() => {
                    setEditingCheque(null);
                    setIsChequeModalOpen(true);
                  }}
                />
              </Card>
            ) : (
              cheques.map((cheque, idx) => {
                const dueInfo = getDueStatus(cheque.dueDate);

                return (
                  <motion.div
                    key={cheque.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.15, delay: idx * 0.03 }}
                  >
                    <Card
                      variant="glass"
                      hoverLift={true}
                      className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-3.5">
                        <div
                          className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border border-white/10 ${
                            cheque.status === 'passed' || cheque.status === 'cleared'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : cheque.status === 'bounced'
                              ? 'bg-rose-500/20 text-rose-400'
                              : 'bg-violet-500/20 text-violet-400'
                          }`}
                        >
                          <FileCheck2 className="w-5 h-5" />
                        </div>

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-sm font-bold text-white">
                              {cheque.partyName}
                            </h3>

                            <Badge
                              variant={cheque.type === 'receivable' ? 'success' : 'danger'}
                              size="sm"
                            >
                              {cheque.type === 'receivable' ? 'چک دریافتی' : 'چک پرداختی'}
                            </Badge>

                            <Badge
                              variant={
                                cheque.status === 'passed' || cheque.status === 'cleared'
                                  ? 'success'
                                  : cheque.status === 'bounced'
                                  ? 'danger'
                                  : 'warning'
                              }
                              size="sm"
                            >
                              {cheque.status === 'passed' || cheque.status === 'cleared'
                                ? 'پاس شده'
                                : cheque.status === 'bounced'
                                ? 'برگشتی'
                                : 'در انتظار'}
                            </Badge>

                            {dueInfo && cheque.status === 'pending' && (
                              <Badge
                                variant={
                                  dueInfo.type === 'overdue'
                                    ? 'danger'
                                    : dueInfo.type === 'soon'
                                    ? 'warning'
                                    : 'neutral'
                                }
                                size="sm"
                              >
                                {dueInfo.label}
                              </Badge>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-2 text-xs text-fintech-text-muted mt-1 font-mono">
                            <span>سررسید: {toPersianDigits(cheque.dueDate)}</span>
                            <span>•</span>
                            <span>بانک: {cheque.bankName}</span>
                            <span>•</span>
                            <span>سریال: {toPersianDigits(cheque.chequeNumber)}</span>
                            {cheque.sayadNumber && (
                              <>
                                <span>•</span>
                                <span className="dir-ltr text-violet-400 font-mono">
                                  صیاد: {toPersianDigits(cheque.sayadNumber)}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-white/5">
                        <div className="text-right sm:text-left">
                          <div className="text-sm sm:text-base font-extrabold text-white font-mono tabular-nums">
                            {formatCurrency(cheque.amount, currency)}
                          </div>
                        </div>

                        {/* Quick Status Actions */}
                        <div className="flex items-center gap-1.5">
                          {cheque.status === 'pending' && (
                            <>
                              <button
                                onClick={() => changeChequeStatus(cheque.id, 'passed')}
                                className="px-2.5 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 text-xs font-bold transition flex items-center gap-1"
                                title="ثبت به عنوان پاس شده"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>پاس شد</span>
                              </button>
                              <button
                                onClick={() => changeChequeStatus(cheque.id, 'bounced')}
                                className="px-2.5 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 text-xs font-bold transition flex items-center gap-1"
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
                              className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-fintech-text-primary text-xs font-bold transition flex items-center gap-1"
                              title="بازگشت به وضعیت در انتظار"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>در انتظار</span>
                            </button>
                          )}

                          <IconButton
                            variant="ghost"
                            size="sm"
                            icon={<Edit2 className="w-4 h-4" />}
                            onClick={() => {
                              setEditingCheque(cheque);
                              setIsChequeModalOpen(true);
                            }}
                            title="ویرایش چک"
                          />
                          <IconButton
                            variant="ghost"
                            size="sm"
                            icon={<Trash2 className="w-4 h-4 text-rose-400" />}
                            onClick={() => handleDeleteCheque(cheque.id)}
                            title="حذف چک"
                          />
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })
            )}
          </motion.div>
        )}
      </AnimatePresence>

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

      <PayDebtModal
        isOpen={!!payingDebt}
        onClose={() => setPayingDebt(null)}
        debt={payingDebt}
      />

      <PersonManagerModal
        isOpen={isPersonModalOpen}
        onClose={() => setIsPersonModalOpen(false)}
      />
    </div>
  );
};

export default DebtsAndChequesView;

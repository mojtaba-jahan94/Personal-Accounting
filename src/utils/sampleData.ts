import { Account, Category, Transaction, Budget, Goal, Debt, Cheque } from '../types';
import { getTodayJalali } from './jalali';

export const DEFAULT_CATEGORIES: Category[] = [
  // Expenses
  { id: 'cat-food', name: 'خوراک و سوپرمارکت', icon: 'Utensils', color: '#f97316', type: 'expense' },
  { id: 'cat-transport', name: 'حمل و نقل و بنزین', icon: 'Car', color: '#3b82f6', type: 'expense' },
  { id: 'cat-housing', name: 'اجاره و مسکن', icon: 'Home', color: '#ef4444', type: 'expense' },
  { id: 'cat-bills', name: 'قبوض و شارژ ساختمان', icon: 'Receipt', color: '#eab308', type: 'expense' },
  { id: 'cat-health', name: 'سلامت و درمان', icon: 'HeartPulse', color: '#ec4899', type: 'expense' },
  { id: 'cat-fun', name: 'تفریح و رستوران', icon: 'Coffee', color: '#8b5cf6', type: 'expense' },
  { id: 'cat-shopping', name: 'پوشاک و خرید', icon: 'ShoppingBag', color: '#06b6d4', type: 'expense' },
  { id: 'cat-education', name: 'آموزش و کتاب', icon: 'GraduationCap', color: '#10b981', type: 'expense' },
  { id: 'cat-other-exp', name: 'سایر هزینه‌ها', icon: 'MoreHorizontal', color: '#64748b', type: 'expense' },

  // Incomes
  { id: 'cat-salary', name: 'حقوق و دستمزد', icon: 'Briefcase', color: '#10b981', type: 'income' },
  { id: 'cat-freelance', name: 'پروژه و فریلنسری', icon: 'Laptop', color: '#3b82f6', type: 'income' },
  { id: 'cat-investment', name: 'سود سرمایه‌گذاری و بورس', icon: 'TrendingUp', color: '#8b5cf6', type: 'income' },
  { id: 'cat-gift', name: 'هدیه و پاداش', icon: 'Gift', color: '#f59e0b', type: 'income' },
  { id: 'cat-other-inc', name: 'سایر درآمدها', icon: 'PlusCircle', color: '#64748b', type: 'income' },
];

export const DEFAULT_ACCOUNTS: Account[] = [
  {
    id: 'acc-mellat',
    name: 'حساب اصلی ملت',
    type: 'bank',
    bankName: 'بانک ملت',
    cardNumber: '6104337890123456',
    shaba: 'IR820120000000001234567890',
    balance: 18500000,
    color: '#dc2626',
    isDefault: true,
  },
  {
    id: 'acc-blubank',
    name: 'بلو بانک (سامان)',
    type: 'bank',
    bankName: 'بلو بانک',
    cardNumber: '6219861054321987',
    balance: 4200000,
    color: '#2563eb',
  },
  {
    id: 'acc-cash',
    name: 'کیف پول نقدی',
    type: 'cash',
    balance: 850000,
    color: '#059669',
  },
  {
    id: 'acc-gold',
    name: 'صندوق طلا و پس‌انداز',
    type: 'gold_crypto',
    balance: 65000000,
    color: '#d97706',
  }
];

export function getDemoData(): {
  accounts: Account[];
  transactions: Transaction[];
  budgets: Budget[];
  goals: Goal[];
  debts: Debt[];
  cheques: Cheque[];
} {
  const today = getTodayJalali();
  const parts = today.split('/');
  const jy = parts[0];
  const jm = parts[1];

  const currentMonthPrefix = `${jy}/${jm}`;

  const transactions: Transaction[] = [
    {
      id: 'tx-1',
      type: 'income',
      amount: 32000000,
      date: `${currentMonthPrefix}/01`,
      time: '10:30',
      description: 'واریز حقوق ماهانه شرکت',
      categoryId: 'cat-salary',
      accountId: 'acc-mellat',
      tags: ['حقوق', 'شرکت'],
    },
    {
      id: 'tx-2',
      type: 'expense',
      amount: 7500000,
      date: `${currentMonthPrefix}/02`,
      time: '14:15',
      description: 'اجاره بها و شارژ ساختمان',
      categoryId: 'cat-housing',
      accountId: 'acc-mellat',
      tags: ['منزل'],
    },
    {
      id: 'tx-3',
      type: 'expense',
      amount: 1450000,
      date: `${currentMonthPrefix}/05`,
      time: '18:40',
      description: 'خرید مایحتاج هفتگی فروشگاه رفاه',
      categoryId: 'cat-food',
      accountId: 'acc-blubank',
      tags: ['خرید'],
    },
    {
      id: 'tx-4',
      type: 'expense',
      amount: 450000,
      date: `${currentMonthPrefix}/07`,
      time: '20:10',
      description: 'کافه و عصرانه با دوستان',
      categoryId: 'cat-fun',
      accountId: 'acc-blubank',
      tags: ['تفریح'],
    },
    {
      id: 'tx-5',
      type: 'expense',
      amount: 300000,
      date: `${currentMonthPrefix}/09`,
      time: '09:15',
      description: 'بنزین و کارواش',
      categoryId: 'cat-transport',
      accountId: 'acc-mellat',
      tags: ['ماشین'],
    },
    {
      id: 'tx-6',
      type: 'income',
      amount: 6000000,
      date: `${currentMonthPrefix}/11`,
      time: '16:00',
      description: 'دستمزد طراحی وب‌سایت فریلنسری',
      categoryId: 'cat-freelance',
      accountId: 'acc-blubank',
      tags: ['پروژه'],
    },
    {
      id: 'tx-7',
      type: 'transfer',
      amount: 3000000,
      date: `${currentMonthPrefix}/12`,
      time: '11:20',
      description: 'انتقال برای پس‌انداز و صندوق طلا',
      categoryId: 'cat-other-exp',
      accountId: 'acc-mellat',
      toAccountId: 'acc-gold',
      fee: 1000,
    },
    {
      id: 'tx-8',
      type: 'expense',
      amount: 650000,
      date: `${currentMonthPrefix}/14`,
      time: '19:30',
      description: 'دارو و ویزیت دندان‌پزشکی',
      categoryId: 'cat-health',
      accountId: 'acc-mellat',
      tags: ['پزشکی'],
    }
  ];

  const budgets: Budget[] = [
    { id: 'b-1', categoryId: 'cat-food', amount: 5000000, month: currentMonthPrefix },
    { id: 'b-2', categoryId: 'cat-fun', amount: 2000000, month: currentMonthPrefix },
    { id: 'b-3', categoryId: 'cat-transport', amount: 1500000, month: currentMonthPrefix },
    { id: 'b-4', categoryId: 'cat-shopping', amount: 3000000, month: currentMonthPrefix },
  ];

  const goals: Goal[] = [
    {
      id: 'g-1',
      title: 'خرید لپ‌تاپ جدید',
      targetAmount: 60000000,
      currentAmount: 38000000,
      deadline: `${jy}/11/30`,
      category: 'تجهیزات',
      icon: 'Laptop',
      color: '#4f46e5'
    },
    {
      id: 'g-2',
      title: 'سفر تفریحی شمال',
      targetAmount: 15000000,
      currentAmount: 12500000,
      deadline: `${jy}/08/15`,
      category: 'سفر',
      icon: 'Compass',
      color: '#06b6d4'
    },
    {
      id: 'g-3',
      title: 'صندوق شرایط اضطراری',
      targetAmount: 50000000,
      currentAmount: 20000000,
      deadline: `${jy}/12/29`,
      category: 'امنیت مالی',
      icon: 'ShieldCheck',
      color: '#10b981'
    }
  ];

  const debts: Debt[] = [
    {
      id: 'd-1',
      type: 'credit', // من طلبکارم
      personName: 'علی رضایی (همکار)',
      phoneNumber: '09123456789',
      amount: 4000000,
      paidAmount: 1500000,
      dueDate: `${currentMonthPrefix}/25`,
      description: 'قرض بابت خرید لپ‌تاپ',
      isSettled: false,
    },
    {
      id: 'd-2',
      type: 'debt', // من بدهکارم
      personName: 'قسط وام ازدواج بانک ملی',
      phoneNumber: '',
      amount: 1800000,
      paidAmount: 0,
      dueDate: `${currentMonthPrefix}/28`,
      description: 'قسط ماه ۲۴ از ۳۶',
      isSettled: false,
    }
  ];

  const cheques: Cheque[] = [
    {
      id: 'ch-1',
      type: 'payable', // چک پرداختی من
      amount: 12000000,
      dueDate: `${jy}/${String(Math.min(12, parseInt(jm, 10) + 1)).padStart(2, '0')}/10`,
      bankName: 'بانک ملت',
      chequeNumber: '784102',
      sayadNumber: '1928374650123456',
      partyName: 'فروشگاه لوازم خانگی اسنوا',
      status: 'pending',
      notes: 'بابت قسط خرید تلویزیون',
    },
    {
      id: 'ch-2',
      type: 'receivable', // چک دریافتی
      amount: 8500000,
      dueDate: `${jy}/${String(Math.min(12, parseInt(jm, 10) + 1)).padStart(2, '0')}/05`,
      bankName: 'بانک صادرات',
      chequeNumber: '334910',
      sayadNumber: '4455667788990011',
      partyName: 'شرکت فناوران عصر نوین',
      status: 'pending',
      notes: 'تسویه فاز اول پروژه نرم‌افزاری',
    }
  ];

  return {
    accounts: DEFAULT_ACCOUNTS,
    transactions,
    budgets,
    goals,
    debts,
    cheques,
  };
}

export type TransactionType = 'expense' | 'income' | 'transfer';

export type AccountType = 'bank' | 'cash' | 'savings' | 'gold_crypto' | 'other';

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: 'expense' | 'income';
}

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  bankName?: string;
  cardNumber?: string;
  shaba?: string;
  color: string;
  isDefault?: boolean;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  date: string; // Jalali format: YYYY/MM/DD
  time?: string;
  description: string;
  categoryId: string;
  accountId: string;
  toAccountId?: string; // For transfers
  fee?: number; // Transfer fee
  receiptUrl?: string; // base64 or image url
  tags?: string[];
}

export interface Budget {
  id: string;
  categoryId: string;
  amount: number;
  month: string; // e.g. "1403-06"
}

export interface Goal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  category?: string;
  icon?: string;
  color?: string;
}

export type DebtType = 'debt' | 'credit'; // debt = بدهی من به دیگران, credit = طلب من از دیگران

export interface Debt {
  id: string;
  type: DebtType;
  personName: string;
  phoneNumber?: string;
  amount: number;
  paidAmount: number;
  dueDate: string;
  description?: string;
  isSettled: boolean;
}

export type ChequeType = 'receivable' | 'payable'; // چک دریافتی یا پرداختی
export type ChequeStatus = 'pending' | 'passed' | 'bounced'; // در جریان، پاس شده، برگشت خورده

export interface Cheque {
  id: string;
  type: ChequeType;
  amount: number;
  dueDate: string;
  bankName: string;
  chequeNumber: string;
  sayadNumber?: string;
  partyName: string; // صادرکننده یا دریافت‌کننده
  status: ChequeStatus;
  notes?: string;
}

export type Currency = 'toman' | 'rial';

export interface FilterOptions {
  searchQuery: string;
  type?: TransactionType | 'all';
  categoryId?: string;
  accountId?: string;
  startDate?: string;
  endDate?: string;
  tag?: string;
}

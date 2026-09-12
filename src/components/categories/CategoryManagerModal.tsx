import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Category } from '../../types';
import { getCategoryIcon } from '../../utils/categoryIcons';
import { X, Plus, Edit2, Trash2, Check, Tag } from 'lucide-react';

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AVAILABLE_ICONS = [
  'Utensils',
  'Car',
  'Home',
  'Receipt',
  'HeartPulse',
  'Coffee',
  'ShoppingBag',
  'GraduationCap',
  'Briefcase',
  'Laptop',
  'TrendingUp',
  'Gift',
  'PlusCircle',
  'CreditCard',
  'Wallet',
  'PiggyBank',
  'Coins',
  'ShieldCheck',
  'Compass',
  'FileText',
];

const PRESET_COLORS = [
  '#f97316', // Orange
  '#3b82f6', // Blue
  '#ef4444', // Red
  '#eab308', // Yellow
  '#ec4899', // Pink
  '#8b5cf6', // Violet
  '#06b6d4', // Cyan
  '#10b981', // Emerald
  '#6366f1', // Indigo
  '#14b8a6', // Teal
  '#f43f5e', // Rose
  '#64748b', // Slate
];

export const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({ isOpen, onClose }) => {
  const { categories, addCategory, updateCategory, deleteCategory } = useFinance();

  const [activeTab, setActiveTab] = useState<'expense' | 'income'>('expense');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('Utensils');
  const [color, setColor] = useState(PRESET_COLORS[0]);

  if (!isOpen) return null;

  const filteredCategories = categories.filter(c => c.type === activeTab);

  const startEdit = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setIcon(cat.icon);
    setColor(cat.color);
  };

  const cancelEdit = () => {
    setEditingCategory(null);
    setName('');
    setIcon('Utensils');
    setColor(PRESET_COLORS[0]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingCategory) {
      updateCategory({
        ...editingCategory,
        name: name.trim(),
        icon,
        color,
      });
    } else {
      addCategory({
        name: name.trim(),
        icon,
        color,
        type: activeTab,
      });
    }

    cancelEdit();
  };

  const handleDelete = (id: string) => {
    if (filteredCategories.length <= 1) {
      alert('حداقل یک دسته‌بندی باید در سیستم باقی بماند.');
      return;
    }
    if (window.confirm('آیا از حذف این دسته‌بندی اطمینان دارید؟')) {
      deleteCategory(id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />

      <div className="relative w-full max-w-lg liquid-glass-card p-5 sm:p-6 my-8 z-10 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200/50 dark:border-white/10">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-2xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                مدیریت دسته‌بندی‌های تراکنش
              </h3>
              <p className="text-[11px] text-slate-500">افزودن، ویرایش و حذف دسته‌های دلخواه</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-white/40 dark:hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch: Expense vs Income */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-200/50 dark:bg-slate-800/80 rounded-2xl">
          <button
            type="button"
            onClick={() => {
              setActiveTab('expense');
              cancelEdit();
            }}
            className={`py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'expense'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            دسته‌بندی‌های هزینه ({categories.filter(c => c.type === 'expense').length})
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('income');
              cancelEdit();
            }}
            className={`py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'income'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            دسته‌بندی‌های درآمد ({categories.filter(c => c.type === 'income').length})
          </button>
        </div>

        {/* Category Form */}
        <form onSubmit={handleSubmit} className="p-4 rounded-2xl liquid-glass border border-indigo-200/40 dark:border-indigo-800/40 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
            <span>{editingCategory ? 'ویرایش دسته‌بندی' : 'افزودن دسته‌بندی جدید'}</span>
            {editingCategory && (
              <button
                type="button"
                onClick={cancelEdit}
                className="text-[11px] text-rose-500 hover:underline"
              >
                انصراف از ویرایش
              </button>
            )}
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              عنوان دسته‌بندی
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثلاً: خرید کتاب، هزینه باشگاه..."
              className="w-full px-3.5 py-2 rounded-xl bg-white/70 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs outline-none"
            />
          </div>

          {/* Color Presets */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1.5">
              رنگ اختصاصی
            </label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-6 h-6 rounded-full transition-transform ${
                    color === c ? 'scale-125 ring-2 ring-indigo-500 ring-offset-2' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Icon Selector */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1.5">
              آیکون دسته‌بندی
            </label>
            <div className="grid grid-cols-6 sm:grid-cols-10 gap-1.5 max-h-28 overflow-y-auto p-1.5 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
              {AVAILABLE_ICONS.map(i => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIcon(i)}
                  className={`p-2 rounded-xl flex items-center justify-center transition ${
                    icon === i
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'hover:bg-white/60 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                  title={i}
                >
                  {getCategoryIcon(i, 'w-4 h-4')}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>{editingCategory ? 'ذخیره تغییرات دسته' : 'ثبت دسته‌بندی'}</span>
          </button>
        </form>

        {/* Existing Categories List */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            فهرست دسته‌بندی‌های موجود ({activeTab === 'expense' ? 'هزینه‌ها' : 'درآمدها'})
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
            {filteredCategories.map(cat => (
              <div
                key={cat.id}
                className="p-3 rounded-2xl liquid-glass border border-slate-200/50 dark:border-white/10 flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs"
                    style={{ backgroundColor: cat.color }}
                  >
                    {getCategoryIcon(cat.icon, 'w-4 h-4')}
                  </div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                    {cat.name}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => startEdit(cat)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-white/40 dark:hover:bg-slate-800"
                    title="ویرایش"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-white/40 dark:hover:bg-slate-800"
                    title="حذف"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

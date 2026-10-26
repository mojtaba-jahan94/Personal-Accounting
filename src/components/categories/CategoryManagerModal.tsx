import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Category } from '../../types';
import { getCategoryIcon } from '../../utils/categoryIcons';
import { X, Edit2, Trash2, Tag, CheckCircle2 } from 'lucide-react';

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
  '#A68A64', // Warm Wood
  '#7D2826', // Coral Red
  '#898861', // Leaf Green
  '#343723', // Juniper Forest
  '#2E7D5B', // Sage Emerald
  '#4A6FA5', // Fjord Blue
  '#C0564B', // Terracotta Rose
  '#d97706', // Gold Amber
  '#0284c7', // Sky Blue
  '#059669', // Emerald
  '#1F2933', // Charcoal
  '#6B7280', // Fjord Gray
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
    <div className="fixed inset-0 z-50 bg-[#1F2933]/75 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full sm:max-w-lg max-h-[92dvh] flex flex-col rounded-t-3xl sm:rounded-3xl border border-[#6B7280]/20 dark:border-[#D1D5DB]/15 bg-[#F7F7F2]/95 dark:bg-[#1F2933]/95 backdrop-blur-2xl text-[#1F2933] dark:text-[#F7F7F2] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
        {/* Mobile drag handle */}
        <div className="pt-2 sm:hidden flex justify-center">
          <div className="w-12 h-1.5 bg-[#6B7280]/30 rounded-full" />
        </div>

        {/* Sticky Header */}
        <div className="px-6 py-4 border-b border-[#6B7280]/15 dark:border-[#D1D5DB]/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#A68A64]/15 border border-[#A68A64]/30 text-[#A68A64] flex items-center justify-center shadow-sm">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-[#1F2933] dark:text-[#F7F7F2]">
                مدیریت دسته‌بندی‌های تراکنش
              </h3>
              <p className="text-xs text-[#6B7280] dark:text-[#D1D5DB]">
                افزودن، ویرایش و شخصی‌سازی دسته‌های هزینه و درآمد
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#6B7280] hover:text-[#1F2933] dark:hover:text-[#F7F7F2] hover:bg-[#6B7280]/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4 overscroll-contain">
          {/* Tab switch: Expense vs Income */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-[#6B7280]/10 dark:bg-[#182028]/60 rounded-2xl border border-[#6B7280]/15 dark:border-[#D1D5DB]/10">
            <button
              type="button"
              onClick={() => {
                setActiveTab('expense');
                cancelEdit();
              }}
              className={`py-2 rounded-xl text-xs font-black transition ${
                activeTab === 'expense'
                  ? 'bg-[#C0564B] text-[#F7F7F2] shadow-sm'
                  : 'text-[#6B7280] dark:text-[#D1D5DB] hover:text-[#1F2933] dark:hover:text-[#F7F7F2]'
              }`}
            >
              هزینه‌ها ({categories.filter(c => c.type === 'expense').length})
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('income');
                cancelEdit();
              }}
              className={`py-2 rounded-xl text-xs font-black transition ${
                activeTab === 'income'
                  ? 'bg-[#2E7D5B] text-[#F7F7F2] shadow-sm'
                  : 'text-[#6B7280] dark:text-[#D1D5DB] hover:text-[#1F2933] dark:hover:text-[#F7F7F2]'
              }`}
            >
              درآمدها ({categories.filter(c => c.type === 'income').length})
            </button>
          </div>

          {/* Category Form */}
          <form onSubmit={handleSubmit} className="p-4 rounded-2xl bg-white/60 dark:bg-[#182028]/60 border border-[#A68A64]/25 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-[#1F2933] dark:text-[#F7F7F2]">
              <span>{editingCategory ? 'ویرایش دسته‌بندی' : 'افزودن دسته‌بندی جدید'}</span>
              {editingCategory && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="text-[11px] text-[#C0564B] hover:underline"
                >
                  انصراف از ویرایش
                </button>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#6B7280] dark:text-[#D1D5DB] mb-1">
                عنوان دسته‌بندی
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثلاً: خرید کتاب، هزینه باشگاه..."
                className="w-full px-3.5 py-2 rounded-xl bg-white/70 dark:bg-[#1F2933] border border-[#6B7280]/20 dark:border-[#D1D5DB]/15 text-xs outline-none focus:border-[#A68A64] text-[#1F2933] dark:text-[#F7F7F2]"
              />
            </div>

            {/* Color Presets */}
            <div>
              <label className="block text-[11px] font-bold text-[#6B7280] dark:text-[#D1D5DB] mb-1.5">
                رنگ اختصاصی
              </label>
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-6 h-6 rounded-full transition-transform border border-white/20 ${
                      color === c ? 'scale-125 ring-2 ring-[#A68A64] ring-offset-2 dark:ring-offset-[#1F2933]' : 'hover:scale-110'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            {/* Icon Selector */}
            <div>
              <label className="block text-[11px] font-bold text-[#6B7280] dark:text-[#D1D5DB] mb-1.5">
                آیکون دسته‌بندی
              </label>
              <div className="grid grid-cols-6 sm:grid-cols-10 gap-1.5 max-h-28 overflow-y-auto p-1.5 rounded-xl border border-[#6B7280]/15 dark:border-[#D1D5DB]/10 bg-white/40 dark:bg-[#1F2933]/40">
                {AVAILABLE_ICONS.map(i => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setIcon(i)}
                    className={`p-2 rounded-xl flex items-center justify-center transition ${
                      icon === i
                        ? 'bg-[#A68A64] text-[#F7F7F2] shadow-sm'
                        : 'hover:bg-[#6B7280]/10 text-[#6B7280] dark:text-[#D1D5DB]'
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
              className="w-full py-2.5 rounded-xl bg-[#A68A64] hover:bg-[#8A704C] text-[#F7F7F2] font-black text-xs shadow-md shadow-[#A68A64]/25 transition active:scale-95 flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{editingCategory ? 'ذخیره تغییرات دسته' : 'ثبت دسته‌بندی'}</span>
            </button>
          </form>

          {/* Existing Categories List */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#1F2933] dark:text-[#F7F7F2]">
              فهرست دسته‌بندی‌های موجود ({activeTab === 'expense' ? 'هزینه‌ها' : 'درآمدها'})
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
              {filteredCategories.map(cat => (
                <div
                  key={cat.id}
                  className="p-3 rounded-2xl bg-white/60 dark:bg-[#182028]/60 border border-[#6B7280]/15 dark:border-[#D1D5DB]/10 flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs"
                      style={{ backgroundColor: cat.color }}
                    >
                      {getCategoryIcon(cat.icon, 'w-4 h-4')}
                    </div>
                    <span className="text-xs font-bold text-[#1F2933] dark:text-[#F7F7F2] truncate">
                      {cat.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => startEdit(cat)}
                      className="p-1.5 rounded-lg text-[#6B7280] hover:text-[#A68A64] hover:bg-[#A68A64]/10 transition"
                      title="ویرایش"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="p-1.5 rounded-lg text-[#6B7280] hover:text-[#C0564B] hover:bg-[#C0564B]/10 transition"
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

        {/* Sticky Footer */}
        <div className="px-6 py-4 border-t border-[#6B7280]/15 dark:border-[#D1D5DB]/10 bg-[#F7F7F2]/90 dark:bg-[#182028]/90 flex items-center justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-[#A68A64] hover:bg-[#8A704C] text-[#F7F7F2] font-black text-xs shadow-lg shadow-[#A68A64]/25 transition active:scale-95"
          >
            بستن پنجره
          </button>
        </div>
      </div>
    </div>
  );
};

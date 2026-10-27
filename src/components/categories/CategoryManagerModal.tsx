import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Category } from '../../types';
import { getCategoryIcon } from '../../utils/categoryIcons';
import { Edit2, Trash2, CheckCircle2 } from 'lucide-react';
import { ModalShell } from '../ui/ModalShell';
import { Button } from '../ui/Button';
import { IconButton } from '../ui/IconButton';

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
  '#DFC296', // Champagne Gold
  '#A390B8', // Muted Lilac
  '#C98A82', // Dusty Rose
  '#7A9A95', // Sage Teal
  '#6E7582', // Warm Slate
  '#8B5CF6', // Vivid Violet
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#3B82F6', // Blue
  '#EC4899', // Pink
  '#6366F1', // Indigo
  '#14B8A6', // Teal
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
      setEditingCategory(null);
    } else {
      addCategory({
        name: name.trim(),
        type: activeTab,
        icon,
        color,
      });
    }

    setName('');
    setIcon('Utensils');
    setColor(PRESET_COLORS[0]);
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
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title="مدیریت دسته‌بندی‌های تراکنش"
      subtitle="افزودن، ویرایش و شخصی‌سازی دسته‌های هزینه و درآمد"
      size="lg"
    >
      <div className="space-y-4">
        {/* Tab switch: Expense vs Income */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-black/30 rounded-2xl border border-white/5">
          <button
            type="button"
            onClick={() => {
              setActiveTab('expense');
              cancelEdit();
            }}
            className={`py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'expense'
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 shadow-xs'
                : 'text-fintech-text-muted hover:text-white'
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
            className={`py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'income'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-xs'
                : 'text-fintech-text-muted hover:text-white'
            }`}
          >
            درآمدها ({categories.filter(c => c.type === 'income').length})
          </button>
        </div>

        {/* Category Form */}
        <form onSubmit={handleSubmit} className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-fintech-text-primary">
            <span>{editingCategory ? 'ویرایش دسته‌بندی' : 'افزودن دسته‌بندی جدید'}</span>
            {editingCategory && (
              <button
                type="button"
                onClick={cancelEdit}
                className="text-[11px] text-rose-400 hover:underline"
              >
                انصراف از ویرایش
              </button>
            )}
          </div>

          <div>
            <label className="block text-[11px] font-bold text-fintech-text-muted mb-1">
              عنوان دسته‌بندی
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثلاً: خرید کتاب، هزینه باشگاه..."
              className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs outline-none focus:border-violet-500/50 text-white"
            />
          </div>

          {/* Color Presets */}
          <div>
            <label className="block text-[11px] font-bold text-fintech-text-muted mb-1.5">
              رنگ اختصاصی
            </label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-6 h-6 rounded-full transition-transform border border-white/20 ${
                    color === c ? 'scale-125 ring-2 ring-violet-400 ring-offset-2 ring-offset-black' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Icon Selector */}
          <div>
            <label className="block text-[11px] font-bold text-fintech-text-muted mb-1.5">
              آیکون دسته‌بندی
            </label>
            <div className="grid grid-cols-6 sm:grid-cols-10 gap-1.5 max-h-28 overflow-y-auto p-1.5 rounded-xl border border-white/10 bg-black/20">
              {AVAILABLE_ICONS.map(i => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIcon(i)}
                  className={`p-2 rounded-xl flex items-center justify-center transition ${
                    icon === i
                      ? 'bg-violet-600 text-white shadow-xs'
                      : 'hover:bg-white/5 text-fintech-text-muted hover:text-white'
                  }`}
                  title={i}
                >
                  {getCategoryIcon(i, 'w-4 h-4')}
                </button>
              ))}
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            icon={<CheckCircle2 className="w-4 h-4" />}
          >
            {editingCategory ? 'ذخیره تغییرات دسته' : 'ثبت دسته‌بندی'}
          </Button>
        </form>

        {/* Existing Categories List */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-fintech-text-primary">
            فهرست دسته‌بندی‌های موجود ({activeTab === 'expense' ? 'هزینه‌ها' : 'درآمدها'})
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
            {filteredCategories.map(cat => (
              <div
                key={cat.id}
                className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs"
                    style={{ backgroundColor: cat.color }}
                  >
                    {getCategoryIcon(cat.icon, 'w-4 h-4')}
                  </div>
                  <span className="text-xs font-bold text-white truncate">
                    {cat.name}
                  </span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <IconButton
                    icon={<Edit2 className="w-3.5 h-3.5" />}
                    onClick={() => startEdit(cat)}
                    size="sm"
                    variant="ghost"
                    title="ویرایش"
                  />
                  <IconButton
                    icon={<Trash2 className="w-3.5 h-3.5 text-rose-400" />}
                    onClick={() => handleDelete(cat.id)}
                    size="sm"
                    variant="ghost"
                    title="حذف"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer action */}
        <div className="flex items-center justify-end pt-3 border-t border-white/10">
          <Button variant="secondary" onClick={onClose}>
            بستن پنجره
          </Button>
        </div>
      </div>
    </ModalShell>
  );
};

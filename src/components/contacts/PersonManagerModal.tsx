import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Person } from '../../types';
import { toPersianDigits } from '../../utils/formatters';
import {
  X,
  Users,
  Plus,
  Edit2,
  Trash2,
  Phone,
  Search,
  Check,
  UserPlus,
  Building2,
  Heart,
  Briefcase,
  User,
} from 'lucide-react';

interface PersonManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPerson?: (person: Person) => void;
}

const RELATIONS = ['دوست', 'خانواده', 'همکار', 'بانک / وام', 'مشتری', 'فروشگاه / کاسب', 'متفرقه'];

export const PersonManagerModal: React.FC<PersonManagerModalProps> = ({
  isOpen,
  onClose,
  onSelectPerson,
}) => {
  const { persons, addPerson, updatePerson, deletePerson } = useFinance();

  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingOrEditing, setIsAddingOrEditing] = useState(false);
  const [editingPersonId, setEditingPersonId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [relation, setRelation] = useState('دوست');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleStartAdd = () => {
    setEditingPersonId(null);
    setName('');
    setPhoneNumber('');
    setRelation('دوست');
    setNotes('');
    setIsAddingOrEditing(true);
  };

  const handleStartEdit = (p: Person) => {
    setEditingPersonId(p.id);
    setName(p.name);
    setPhoneNumber(p.phoneNumber || '');
    setRelation(p.relation || 'دوست');
    setNotes(p.notes || '');
    setIsAddingOrEditing(true);
  };

  const handleCancelForm = () => {
    setIsAddingOrEditing(false);
    setEditingPersonId(null);
  };

  const handleSavePerson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('لطفاً نام شخص یا طرف‌حساب را وارد کنید.');
      return;
    }

    if (editingPersonId) {
      updatePerson({
        id: editingPersonId,
        name: name.trim(),
        phoneNumber: phoneNumber.trim() || undefined,
        relation,
        notes: notes.trim() || undefined,
      });
    } else {
      const created = addPerson({
        name: name.trim(),
        phoneNumber: phoneNumber.trim() || undefined,
        relation,
        notes: notes.trim() || undefined,
      });

      if (onSelectPerson) {
        onSelectPerson(created);
        onClose();
        return;
      }
    }

    setIsAddingOrEditing(false);
    setEditingPersonId(null);
  };

  const handleDelete = (id: string, personName: string) => {
    if (window.confirm(`آیا از حذف "${personName}" از لیست مخاطبین اطمینان دارید؟`)) {
      deletePerson(id);
    }
  };

  const filteredPersons = persons.filter(p => {
    const q = searchTerm.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      (p.phoneNumber && p.phoneNumber.includes(q)) ||
      (p.relation && p.relation.toLowerCase().includes(q)) ||
      (p.notes && p.notes.toLowerCase().includes(q))
    );
  });

  const getRelationBadgeColor = (rel?: string) => {
    switch (rel) {
      case 'خانواده':
        return 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30';
      case 'بانک / وام':
        return 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30';
      case 'همکار':
        return 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30';
      case 'مشتری':
        return 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30';
      default:
        return 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="liquid-glass-card w-full max-w-lg overflow-hidden border border-white/30 dark:border-white/10 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200/50 dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                مدیریت افراد و طرف‌حساب‌ها
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                مخاطبین جهت انتخاب در بدهی، طلب، وام، چک و اسناد مالی
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-200/50 dark:hover:bg-white/10 text-slate-400 hover:text-slate-700 dark:hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Toolbar & Search */}
        <div className="p-4 sm:p-5 border-b border-slate-200/40 dark:border-white/5 bg-slate-50/70 dark:bg-slate-800/40 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute right-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="جستجوی شخص، شماره تماس، نسبت..."
              className="w-full pr-9 pl-3 py-2 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-xs outline-none focus:border-indigo-500"
            />
          </div>

          {!isAddingOrEditing && (
            <button
              onClick={handleStartAdd}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-500/25 shrink-0 active:scale-95 transition"
            >
              <UserPlus className="w-4 h-4" />
              <span className="whitespace-nowrap">افزودن شخص جدید</span>
            </button>
          )}
        </div>

        {/* Body: Form or List */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1">
          {isAddingOrEditing ? (
            <form onSubmit={handleSavePerson} className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/50 dark:border-indigo-800/30">
                <h4 className="text-xs font-black text-indigo-700 dark:text-indigo-300 mb-3 flex items-center gap-1.5">
                  <User className="w-4 h-4" />
                  <span>{editingPersonId ? 'ویرایش مشخصات طرف‌حساب' : 'مشخصات شخص جدید'}</span>
                </h4>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      نام و نام خانوادگی یا عنوان نهاد *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="مثلاً: علی صادقی یا بانک ملی شعبه مرکزی"
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        شماره تماس (اختیاری)
                      </label>
                      <input
                        type="tel"
                        dir="ltr"
                        value={phoneNumber}
                        onChange={e => setPhoneNumber(e.target.value)}
                        placeholder="0912..."
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs outline-none focus:border-indigo-500 text-left font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        نسبت / نوع ارتباط
                      </label>
                      <select
                        value={relation}
                        onChange={e => setRelation(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold outline-none focus:border-indigo-500"
                      >
                        {RELATIONS.map(r => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      توضیحات و یادداشت (اختیاری)
                    </label>
                    <input
                      type="text"
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      placeholder="مثلاً: شماره حساب، شماره وام، آدرس و..."
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-indigo-200/40 dark:border-indigo-800/30">
                  <button
                    type="button"
                    onClick={handleCancelForm}
                    className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    انصراف
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-sm"
                  >
                    {editingPersonId ? 'ذخیره تغییرات' : 'ثبت شخص'}
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div className="space-y-2.5">
              {filteredPersons.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  {searchTerm
                    ? 'شخصی با این مشخصات یافت نشد.'
                    : 'هنوز هیچ طرف‌حسابی ثبت نشده است. با دکمه بالا شخص جدیدی ثبت کنید.'}
                </div>
              ) : (
                filteredPersons.map(person => (
                  <div
                    key={person.id}
                    className="p-3 sm:p-3.5 rounded-2xl bg-white/60 dark:bg-slate-800/40 border border-slate-200/50 dark:border-white/5 flex items-center justify-between gap-3 hover:border-indigo-400/60 hover:shadow-xs transition"
                  >
                    <div
                      className={`flex items-center gap-3 min-w-0 flex-1 ${
                        onSelectPerson ? 'cursor-pointer' : ''
                      }`}
                      onClick={() => onSelectPerson && onSelectPerson(person)}
                    >
                      <div className="w-9 h-9 rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0">
                        {person.relation === 'بانک / وام' ? (
                          <Building2 className="w-4 h-4" />
                        ) : person.relation === 'خانواده' ? (
                          <Heart className="w-4 h-4" />
                        ) : (
                          <User className="w-4 h-4" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate">
                            {person.name}
                          </span>
                          {person.relation && (
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getRelationBadgeColor(
                                person.relation
                              )}`}
                            >
                              {person.relation}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                          {person.phoneNumber && (
                            <span className="font-mono dir-ltr flex items-center gap-1">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span>{toPersianDigits(person.phoneNumber)}</span>
                            </span>
                          )}
                          {person.notes && (
                            <>
                              {person.phoneNumber && <span>•</span>}
                              <span className="truncate max-w-[150px]">{person.notes}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {onSelectPerson && (
                        <button
                          onClick={() => onSelectPerson(person)}
                          className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold transition"
                        >
                          انتخاب
                        </button>
                      )}
                      <button
                        onClick={() => handleStartEdit(person)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                        title="ویرایش"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(person.id, person.name)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                        title="حذف"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-slate-200/50 dark:border-white/10 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400">
            مجموع مخاطبین: {toPersianDigits(persons.length)} نفر
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition"
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  );
};

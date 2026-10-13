import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Person } from '../../types';
import { toPersianDigits } from '../../utils/formatters';
import {
  X,
  Users,
  Edit2,
  Trash2,
  Phone,
  Search,
  UserPlus,
  Building2,
  Heart,
  User,
  CheckCircle2,
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
        return 'bg-[#C0564B]/15 text-[#C0564B] border-[#C0564B]/30';
      case 'بانک / وام':
        return 'bg-[#A68A64]/15 text-[#A68A64] border-[#A68A64]/30';
      case 'همکار':
        return 'bg-[#4A6FA5]/15 text-[#4A6FA5] border-[#4A6FA5]/30';
      case 'مشتری':
        return 'bg-[#2E7D5B]/15 text-[#2E7D5B] border-[#2E7D5B]/30';
      default:
        return 'bg-[#6B7280]/15 text-[#6B7280] dark:text-[#D1D5DB] border-[#6B7280]/30';
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
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-[#1F2933] dark:text-[#F7F7F2]">
                مدیریت افراد و طرف‌حساب‌ها
              </h3>
              <p className="text-xs text-[#6B7280] dark:text-[#D1D5DB]">
                مخاطبین جهت ثبت در بدهی، طلب، وام و چک
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

        {/* Action Toolbar & Search */}
        <div className="p-4 sm:p-5 border-b border-[#6B7280]/15 dark:border-[#D1D5DB]/10 bg-[#6B7280]/5 dark:bg-[#182028]/60 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute right-3 top-2.5 text-[#6B7280]" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="جستجوی شخص، شماره تماس، نسبت..."
              className="w-full pr-9 pl-3 py-2 rounded-xl bg-white/70 dark:bg-[#1F2933] border border-[#6B7280]/20 dark:border-[#D1D5DB]/15 text-xs outline-none focus:border-[#A68A64] text-[#1F2933] dark:text-[#F7F7F2]"
            />
          </div>

          {!isAddingOrEditing && (
            <button
              onClick={handleStartAdd}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#A68A64] hover:bg-[#8A704C] text-[#F7F7F2] text-xs font-bold shadow-md shadow-[#A68A64]/25 shrink-0 active:scale-95 transition"
            >
              <UserPlus className="w-4 h-4" />
              <span className="whitespace-nowrap">افزودن شخص جدید</span>
            </button>
          )}
        </div>

        {/* Scrollable Body: Form or List */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4 overscroll-contain">
          {isAddingOrEditing ? (
            <form onSubmit={handleSavePerson} className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-white/60 dark:bg-[#182028]/60 border border-[#A68A64]/30 space-y-3">
                <h4 className="text-xs font-black text-[#A68A64] mb-3 flex items-center gap-1.5">
                  <User className="w-4 h-4" />
                  <span>{editingPersonId ? 'ویرایش مشخصات طرف‌حساب' : 'مشخصات شخص جدید'}</span>
                </h4>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-[#1F2933] dark:text-[#F7F7F2] mb-1">
                      نام و نام خانوادگی یا عنوان نهاد <span className="text-[#C0564B]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="مثلاً: علی صادقی یا بانک ملی شعبه مرکزی"
                      className="w-full px-3 py-2 rounded-xl bg-white/70 dark:bg-[#1F2933] border border-[#6B7280]/20 dark:border-[#D1D5DB]/15 text-xs outline-none focus:border-[#A68A64] text-[#1F2933] dark:text-[#F7F7F2]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#1F2933] dark:text-[#F7F7F2] mb-1">
                        شماره تماس (اختیاری)
                      </label>
                      <input
                        type="tel"
                        dir="ltr"
                        value={phoneNumber}
                        onChange={e => setPhoneNumber(e.target.value)}
                        placeholder="0912..."
                        className="w-full px-3 py-2 rounded-xl bg-white/70 dark:bg-[#1F2933] border border-[#6B7280]/20 dark:border-[#D1D5DB]/15 text-xs outline-none focus:border-[#A68A64] text-left font-mono text-[#1F2933] dark:text-[#F7F7F2]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#1F2933] dark:text-[#F7F7F2] mb-1">
                        نسبت / نوع ارتباط
                      </label>
                      <select
                        value={relation}
                        onChange={e => setRelation(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white/70 dark:bg-[#1F2933] border border-[#6B7280]/20 dark:border-[#D1D5DB]/15 text-xs font-bold outline-none focus:border-[#A68A64] text-[#1F2933] dark:text-[#F7F7F2]"
                      >
                        {RELATIONS.map(r => (
                          <option key={r} value={r} className="dark:bg-[#1F2933]">
                            {r}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1F2933] dark:text-[#F7F7F2] mb-1">
                      توضیحات و یادداشت (اختیاری)
                    </label>
                    <input
                      type="text"
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      placeholder="مثلاً: شماره حساب، آدرس و..."
                      className="w-full px-3 py-2 rounded-xl bg-white/70 dark:bg-[#1F2933] border border-[#6B7280]/20 dark:border-[#D1D5DB]/15 text-xs outline-none focus:border-[#A68A64] text-[#1F2933] dark:text-[#F7F7F2]"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-[#6B7280]/15 dark:border-[#D1D5DB]/10">
                  <button
                    type="button"
                    onClick={handleCancelForm}
                    className="px-3 py-1.5 rounded-xl border border-[#6B7280]/20 dark:border-[#D1D5DB]/15 text-[#6B7280] dark:text-[#D1D5DB] text-xs font-bold hover:bg-[#6B7280]/10 transition"
                  >
                    انصراف
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-[#A68A64] hover:bg-[#8A704C] text-[#F7F7F2] text-xs font-bold transition shadow-sm"
                  >
                    {editingPersonId ? 'ذخیره تغییرات' : 'ثبت شخص'}
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div className="space-y-2.5">
              {filteredPersons.length === 0 ? (
                <div className="text-center py-12 text-[#6B7280] text-xs">
                  {searchTerm
                    ? 'شخصی با این مشخصات یافت نشد.'
                    : 'هنوز هیچ طرف‌حسابی ثبت نشده است. با دکمه بالا شخص جدیدی ثبت کنید.'}
                </div>
              ) : (
                filteredPersons.map(person => (
                  <div
                    key={person.id}
                    className="p-3 sm:p-3.5 rounded-2xl bg-white/60 dark:bg-[#182028]/60 border border-[#6B7280]/15 dark:border-[#D1D5DB]/10 flex items-center justify-between gap-3 hover:border-[#A68A64]/40 transition"
                  >
                    <div
                      className={`flex items-center gap-3 min-w-0 flex-1 ${
                        onSelectPerson ? 'cursor-pointer' : ''
                      }`}
                      onClick={() => onSelectPerson && onSelectPerson(person)}
                    >
                      <div className="w-9 h-9 rounded-xl bg-[#A68A64]/15 text-[#A68A64] flex items-center justify-center font-bold text-xs shrink-0">
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
                          <span className="text-xs sm:text-sm font-black text-[#1F2933] dark:text-[#F7F7F2] truncate">
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

                        <div className="flex items-center gap-2 text-[11px] text-[#6B7280] dark:text-[#D1D5DB] mt-0.5">
                          {person.phoneNumber && (
                            <span className="font-mono dir-ltr flex items-center gap-1">
                              <Phone className="w-3 h-3 text-[#6B7280]" />
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
                          className="px-2.5 py-1 rounded-lg bg-[#2E7D5B] hover:bg-[#25664a] text-white text-[11px] font-bold transition"
                        >
                          انتخاب
                        </button>
                      )}
                      <button
                        onClick={() => handleStartEdit(person)}
                        className="p-1.5 rounded-lg text-[#6B7280] hover:text-[#A68A64] hover:bg-[#A68A64]/10 transition"
                        title="ویرایش"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(person.id, person.name)}
                        className="p-1.5 rounded-lg text-[#6B7280] hover:text-[#C0564B] hover:bg-[#C0564B]/10 transition"
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

        {/* Sticky Footer */}
        <div className="px-6 py-4 border-t border-[#6B7280]/15 dark:border-[#D1D5DB]/10 bg-[#F7F7F2]/90 dark:bg-[#182028]/90 flex items-center justify-between text-xs shrink-0">
          <span className="text-[#6B7280] dark:text-[#D1D5DB]">
            مجموع مخاطبین: {toPersianDigits(persons.length)} نفر
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#A68A64] hover:bg-[#8A704C] text-[#F7F7F2] font-black text-xs shadow-lg shadow-[#A68A64]/25 transition active:scale-95"
          >
            بستن پنجره
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Person } from '../../types';
import { toPersianDigits } from '../../utils/formatters';
import {
  Edit2,
  Trash2,
  Phone,
  Search,
  UserPlus,
  Building2,
  Heart,
  User,
} from 'lucide-react';
import { ModalShell } from '../ui/ModalShell';
import { Button } from '../ui/Button';
import { IconButton } from '../ui/IconButton';

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
    if (window.confirm(`آیا از حذف «${personName}» از دفترچه مخاطبین اطمینان دارید؟`)) {
      deletePerson(id);
    }
  };

  const filteredPersons = persons.filter(p => {
    if (!searchTerm.trim()) return true;
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
        return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
      case 'بانک / وام':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'همکار':
        return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
      case 'مشتری':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      default:
        return 'bg-white/10 text-fintech-text-muted border-white/10';
    }
  };

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title="مدیریت افراد و طرف‌حساب‌ها"
      subtitle="مخاطبین جهت ثبت در بدهی، طلب، وام و چک"
      size="lg"
    >
      <div className="space-y-4">
        {/* Action Toolbar & Search */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute right-3 top-2.5 text-fintech-text-muted" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="جستجوی شخص، شماره تماس، نسبت..."
              className="w-full pr-9 pl-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs outline-none focus:border-violet-500/50 text-white"
            />
          </div>

          {!isAddingOrEditing && (
            <Button
              onClick={handleStartAdd}
              variant="primary"
              size="sm"
              icon={<UserPlus className="w-4 h-4" />}
              className="w-full sm:w-auto"
            >
              افزودن شخص جدید
            </Button>
          )}
        </div>

        {/* Form or List */}
        {isAddingOrEditing ? (
          <form onSubmit={handleSavePerson} className="p-4 rounded-2xl bg-white/[0.03] border border-violet-500/20 space-y-3">
            <h4 className="text-xs font-bold text-violet-400 mb-3 flex items-center gap-1.5">
              <User className="w-4 h-4" />
              <span>{editingPersonId ? 'ویرایش مشخصات طرف‌حساب' : 'مشخصات شخص جدید'}</span>
            </h4>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-fintech-text-primary mb-1">
                  نام و نام خانوادگی یا عنوان نهاد <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="مثلاً: علی صادقی یا بانک ملی شعبه مرکزی"
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs outline-none focus:border-violet-500/50 text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-fintech-text-primary mb-1">
                    شماره تماس (اختیاری)
                  </label>
                  <input
                    type="tel"
                    dir="ltr"
                    value={phoneNumber}
                    onChange={e => setPhoneNumber(e.target.value)}
                    placeholder="0912..."
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs outline-none focus:border-violet-500/50 text-left font-mono text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-fintech-text-primary mb-1">
                    نسبت / نوع ارتباط
                  </label>
                  <select
                    value={relation}
                    onChange={e => setRelation(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-bold outline-none focus:border-violet-500/50 text-white"
                  >
                    {RELATIONS.map(r => (
                      <option key={r} value={r} className="bg-[#121215] text-white">
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-fintech-text-primary mb-1">
                  توضیحات و یادداشت (اختیاری)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="مثلاً: شماره حساب، آدرس و..."
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs outline-none focus:border-violet-500/50 text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleCancelForm}
              >
                انصراف
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
              >
                {editingPersonId ? 'ذخیره تغییرات' : 'ثبت شخص'}
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {filteredPersons.length === 0 ? (
              <div className="text-center py-12 text-fintech-text-muted text-xs">
                {searchTerm
                  ? 'شخصی با این مشخصات یافت نشد.'
                  : 'هنوز هیچ طرف‌حسابی ثبت نشده است. با دکمه بالا شخص جدیدی ثبت کنید.'}
              </div>
            ) : (
              filteredPersons.map(person => (
                <div
                  key={person.id}
                  className="p-3 sm:p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between gap-3 hover:border-violet-500/30 transition"
                >
                  <div
                    className={`flex items-center gap-3 min-w-0 flex-1 ${
                      onSelectPerson ? 'cursor-pointer' : ''
                    }`}
                    onClick={() => onSelectPerson && onSelectPerson(person)}
                  >
                    <div className="w-9 h-9 rounded-xl bg-violet-500/15 text-violet-400 flex items-center justify-center font-bold text-xs shrink-0">
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
                        <span className="text-xs sm:text-sm font-bold text-white truncate">
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

                      <div className="flex items-center gap-2 text-[11px] text-fintech-text-muted mt-0.5">
                        {person.phoneNumber && (
                          <span className="font-mono dir-ltr flex items-center gap-1">
                            <Phone className="w-3 h-3 text-fintech-text-muted" />
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
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-[11px] font-bold border border-emerald-500/30 transition"
                      >
                        انتخاب
                      </button>
                    )}
                    <IconButton
                      icon={<Edit2 className="w-3.5 h-3.5" />}
                      onClick={() => handleStartEdit(person)}
                      size="sm"
                      variant="ghost"
                      title="ویرایش"
                    />
                    <IconButton
                      icon={<Trash2 className="w-3.5 h-3.5 text-rose-400" />}
                      onClick={() => handleDelete(person.id, person.name)}
                      size="sm"
                      variant="ghost"
                      title="حذف"
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs">
          <span className="text-fintech-text-muted">
            مجموع مخاطبین: {toPersianDigits(persons.length)} نفر
          </span>
          <Button variant="secondary" size="sm" onClick={onClose}>
            بستن پنجره
          </Button>
        </div>
      </div>
    </ModalShell>
  );
};

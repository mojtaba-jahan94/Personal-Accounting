import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronRight,
  ChevronLeft,
  X,
  RotateCcw,
} from 'lucide-react';
import {
  gregorianToJalali,
  jalaliToGregorian,
  getTodayJalali,
  getDaysInJalaliMonth,
  PERSIAN_MONTHS,
  normalizeJalaliDate,
} from '../../utils/jalali';

interface JalaliDatePickerProps {
  value: string; // Format: "1403/06/15" or "1403-06-15"
  onChange: (date: string) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
  inputClassName?: string;
  disabled?: boolean;
}

export const JalaliDatePicker: React.FC<JalaliDatePickerProps> = ({
  value,
  onChange,
  label,
  placeholder = '1403/07/01',
  required = false,
  className = '',
  inputClassName = '',
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse current value or fallback to today
  const today = getTodayJalali();
  const parsedValue = useMemo(() => {
    if (!value) return null;
    const norm = normalizeJalaliDate(value);
    const parts = norm.split('/');
    if (parts.length === 3) {
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10);
      const d = parseInt(parts[2], 10);
      if (!isNaN(y) && !isNaN(m) && !isNaN(d) && m >= 1 && m <= 12 && d >= 1 && d <= 31) {
        return { year: y, month: m, day: d, formatted: norm };
      }
    }
    return null;
  }, [value]);

  // Today parsed
  const todayParsed = useMemo(() => {
    const parts = today.split('/');
    return {
      year: parseInt(parts[0], 10),
      month: parseInt(parts[1], 10),
      day: parseInt(parts[2], 10),
    };
  }, [today]);

  // View state (Year & Month currently viewed in the calendar)
  const [viewYear, setViewYear] = useState<number>(parsedValue?.year || todayParsed.year);
  const [viewMonth, setViewMonth] = useState<number>(parsedValue?.month || todayParsed.month);
  const [isMonthSelectOpen, setIsMonthSelectOpen] = useState(false);
  const [isYearSelectOpen, setIsYearSelectOpen] = useState(false);

  // Sync view state when value changes and calendar opens
  useEffect(() => {
    if (isOpen) {
      if (parsedValue) {
        setViewYear(parsedValue.year);
        setViewMonth(parsedValue.month);
      } else {
        setViewYear(todayParsed.year);
        setViewMonth(todayParsed.month);
      }
    }
  }, [isOpen, parsedValue, todayParsed]);

  // Close calendar when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsMonthSelectOpen(false);
        setIsYearSelectOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        setIsMonthSelectOpen(false);
        setIsYearSelectOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Navigate months
  const handlePrevMonth = () => {
    if (viewMonth === 1) {
      setViewMonth(12);
      setViewYear(prev => prev - 1);
    } else {
      setViewMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 12) {
      setViewMonth(1);
      setViewYear(prev => prev + 1);
    } else {
      setViewMonth(prev => prev + 1);
    }
  };

  // Select day
  const handleSelectDay = (day: number) => {
    const formatted = `${viewYear}/${String(viewMonth).padStart(2, '0')}/${String(day).padStart(2, '0')}`;
    onChange(formatted);
    setIsOpen(false);
  };

  // Quick preset: Today
  const handleSelectToday = () => {
    onChange(today);
    setIsOpen(false);
  };

  // Quick preset: Yesterday
  const handleSelectYesterday = () => {
    const now = new Date();
    now.setDate(now.getDate() - 1);
    const [jy, jm, jd] = gregorianToJalali(now.getFullYear(), now.getMonth() + 1, now.getDate());
    const formatted = `${jy}/${String(jm).padStart(2, '0')}/${String(jd).padStart(2, '0')}`;
    onChange(formatted);
    setIsOpen(false);
  };

  // Days in current viewed month
  const daysInMonth = useMemo(() => {
    return getDaysInJalaliMonth(viewYear, viewMonth);
  }, [viewYear, viewMonth]);

  // Calculate day-of-week index for day 1 of the viewed month
  // Persian week starts on Saturday (شنبه): 0 = شنبه, ..., 6 = جمعه
  const startDayOfWeek = useMemo(() => {
    const [gy, gm, gd] = jalaliToGregorian(viewYear, viewMonth, 1);
    const date = new Date(gy, gm - 1, gd);
    return (date.getDay() + 1) % 7;
  }, [viewYear, viewMonth]);

  // Year range for quick picker (from 1390 to 1410)
  const yearsList = useMemo(() => {
    const years: number[] = [];
    for (let y = todayParsed.year - 6; y <= todayParsed.year + 6; y++) {
      years.push(y);
    }
    return years;
  }, [todayParsed.year]);

  const WEEK_DAYS = [
    { label: 'ش', full: 'شنبه' },
    { label: 'ی', full: 'یکشنبه' },
    { label: 'د', full: 'دوشنبه' },
    { label: 'س', full: 'سه‌شنبه' },
    { label: 'چ', full: 'چهارشنبه' },
    { label: 'پ', full: 'پنجشنبه' },
    { label: 'ج', full: 'جمعه', isWeekend: true },
  ];

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      {/* Input container */}
      <div className="relative flex items-center">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          onClick={() => !disabled && setIsOpen(true)}
          className={`w-full pr-9 pl-12 py-2.5 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-bold font-mono text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition cursor-pointer select-none ${inputClassName}`}
          readOnly
        />
        <div
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className="absolute right-3 text-slate-400 dark:text-slate-500 cursor-pointer hover:text-indigo-600 transition"
        >
          <CalendarIcon className="w-4 h-4" />
        </div>

        {/* Quick today shortcut pill inside input */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleSelectToday();
          }}
          className="absolute left-2 px-2 py-0.5 text-[10px] rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-bold transition"
        >
          امروز
        </button>
      </div>

      {/* Floating Calendar Popover */}
      {isOpen && (
        <div
          dir="rtl"
          className="absolute z-50 mt-1.5 right-0 left-auto w-[290px] sm:w-[310px] p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Calendar Header: Month, Year, and Nav Arrows */}
          <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-100 dark:border-slate-800">
            {/* Right arrow in RTL goes to Next Month */}
            <button
              type="button"
              onClick={handleNextMonth}
              title="ماه بعد"
              className="p-1 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Current Month & Year Selectors */}
            <div className="flex items-center gap-1.5 font-bold text-xs">
              {/* Month Dropdown Button */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setIsMonthSelectOpen(!isMonthSelectOpen);
                    setIsYearSelectOpen(false);
                  }}
                  className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 transition"
                >
                  {PERSIAN_MONTHS[viewMonth - 1]}
                </button>
                {isMonthSelectOpen && (
                  <div className="absolute top-full mt-1 right-0 w-40 max-h-48 overflow-y-auto bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-20 p-1 grid grid-cols-2 gap-1 text-[11px]">
                    {PERSIAN_MONTHS.map((m, idx) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => {
                          setViewMonth(idx + 1);
                          setIsMonthSelectOpen(false);
                        }}
                        className={`px-2 py-1.5 rounded-lg text-center font-bold transition ${
                          viewMonth === idx + 1
                            ? 'bg-indigo-600 text-white'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Year Dropdown Button */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setIsYearSelectOpen(!isYearSelectOpen);
                    setIsMonthSelectOpen(false);
                  }}
                  className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 transition font-mono"
                >
                  {viewYear}
                </button>
                {isYearSelectOpen && (
                  <div className="absolute top-full mt-1 left-0 w-36 max-h-48 overflow-y-auto bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-20 p-1 grid grid-cols-2 gap-1 text-[11px] font-mono">
                    {yearsList.map((y) => (
                      <button
                        key={y}
                        type="button"
                        onClick={() => {
                          setViewYear(y);
                          setIsYearSelectOpen(false);
                        }}
                        className={`px-2 py-1.5 rounded-lg text-center font-bold transition ${
                          viewYear === y
                            ? 'bg-indigo-600 text-white'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {y}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Left arrow in RTL goes to Prev Month */}
            <button
              type="button"
              onClick={handlePrevMonth}
              title="ماه قبل"
              className="p-1 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1.5">
            {WEEK_DAYS.map((w, index) => (
              <span
                key={index}
                title={w.full}
                className={`text-[11px] font-bold py-1 ${
                  w.isWeekend ? 'text-rose-500' : 'text-slate-400 dark:text-slate-500'
                }`}
              >
                {w.label}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {/* Empty slots before first day */}
            {Array.from({ length: startDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="w-8 h-8" />
            ))}

            {/* Days of the month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const isSelected =
                parsedValue &&
                parsedValue.year === viewYear &&
                parsedValue.month === viewMonth &&
                parsedValue.day === day;

              const isToday =
                todayParsed.year === viewYear &&
                todayParsed.month === viewMonth &&
                todayParsed.day === day;

              const dayOfWeek = (startDayOfWeek + i) % 7;
              const isFriday = dayOfWeek === 6;

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleSelectDay(day)}
                  className={`w-8 h-8 sm:w-9 sm:h-9 mx-auto rounded-xl flex items-center justify-center text-xs font-mono font-bold transition ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : isToday
                      ? 'border-2 border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/40'
                      : isFriday
                      ? 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Quick Presets & Close Footer */}
          <div className="flex items-center justify-between pt-3 mt-2.5 border-t border-slate-100 dark:border-slate-800 text-[11px] font-bold">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleSelectToday}
                className="px-2 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition"
              >
                امروز
              </button>
              <button
                type="button"
                onClick={handleSelectYesterday}
                className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              >
                دیروز
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-2 py-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition"
            >
              بستن
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

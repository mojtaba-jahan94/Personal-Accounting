import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
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
  const inputContainerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ top: number; left: number; right: number; isAbove: boolean } | null>(null);
  const [isMobile, setIsMobile] = useState(false);

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

  // Detect screen size and update popover coordinates
  const updatePosition = useCallback(() => {
    if (typeof window === 'undefined') return;
    const mobile = window.innerWidth < 640;
    setIsMobile(mobile);

    if (!mobile && inputContainerRef.current) {
      const rect = inputContainerRef.current.getBoundingClientRect();
      const popoverHeight = 360;
      const spaceBelow = window.innerHeight - rect.bottom;
      const isAbove = spaceBelow < popoverHeight && rect.top > popoverHeight;

      setCoords({
        top: isAbove ? rect.top - 6 : rect.bottom + 6,
        left: rect.left,
        right: window.innerWidth - rect.right,
        isAbove,
      });
    }
  }, []);

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
      updatePosition();
    }
  }, [isOpen, parsedValue, todayParsed, updatePosition]);

  // Close calendar when clicking outside or pressing Escape or on window resize
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        popoverRef.current &&
        !popoverRef.current.contains(target)
      ) {
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

    const handleScrollOrResize = () => {
      if (isOpen) {
        updatePosition();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
      window.addEventListener('resize', handleScrollOrResize);
      window.addEventListener('scroll', handleScrollOrResize, true);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('scroll', handleScrollOrResize, true);
    };
  }, [isOpen, updatePosition]);

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

  // Select day - strictly zero padded YYYY/MM/DD
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

  const calendarPopoverContent = (
    <div
      ref={popoverRef}
      dir="rtl"
      className="w-[310px] sm:w-[320px] p-4 bg-[#F7F7F2] dark:bg-[#1F2933] border border-[#6B7280]/20 dark:border-[#D1D5DB]/20 rounded-2xl shadow-2xl text-[#1F2933] dark:text-[#F7F7F2] select-none animate-in fade-in zoom-in-95 duration-150"
    >
      {/* Calendar Header: Month, Year, and Nav Arrows */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#6B7280]/15 dark:border-[#D1D5DB]/15">
        {/* Right arrow in RTL goes to Next Month */}
        <button
          type="button"
          onClick={handleNextMonth}
          title="ماه بعد"
          className="p-1.5 rounded-xl text-[#6B7280] dark:text-[#D1D5DB] hover:text-[#1F2933] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Current Month & Year Selectors */}
        <div className="flex items-center gap-2 font-bold text-xs">
          {/* Month Dropdown Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setIsMonthSelectOpen(!isMonthSelectOpen);
                setIsYearSelectOpen(false);
              }}
              className="px-2.5 py-1 rounded-xl bg-black/5 dark:bg-white/5 text-[#1F2933] dark:text-[#F7F7F2] hover:bg-[#A68A64]/15 hover:text-[#A68A64] transition font-bold"
            >
              {PERSIAN_MONTHS[viewMonth - 1]}
            </button>
            {isMonthSelectOpen && (
              <div className="absolute top-full mt-1.5 right-0 w-44 max-h-48 overflow-y-auto bg-[#F7F7F2] dark:bg-[#141B22] border border-[#6B7280]/20 dark:border-[#D1D5DB]/20 rounded-xl shadow-2xl z-30 p-1.5 grid grid-cols-2 gap-1 text-[11px]">
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
                        ? 'bg-[#A68A64] text-[#F7F7F2] shadow-sm'
                        : 'hover:bg-black/5 dark:hover:bg-white/10 text-[#1F2933] dark:text-[#D1D5DB]'
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
              className="px-2.5 py-1 rounded-xl bg-black/5 dark:bg-white/5 text-[#1F2933] dark:text-[#F7F7F2] hover:bg-[#A68A64]/15 hover:text-[#A68A64] transition font-mono font-bold"
            >
              {viewYear}
            </button>
            {isYearSelectOpen && (
              <div className="absolute top-full mt-1.5 left-0 w-36 max-h-48 overflow-y-auto bg-[#F7F7F2] dark:bg-[#141B22] border border-[#6B7280]/20 dark:border-[#D1D5DB]/20 rounded-xl shadow-2xl z-30 p-1.5 grid grid-cols-2 gap-1 text-[11px] font-mono">
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
                        ? 'bg-[#A68A64] text-[#F7F7F2] shadow-sm'
                        : 'hover:bg-black/5 dark:hover:bg-white/10 text-[#1F2933] dark:text-[#D1D5DB]'
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
          className="p-1.5 rounded-xl text-[#6B7280] dark:text-[#D1D5DB] hover:text-[#1F2933] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition"
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
              w.isWeekend ? 'text-[#C0564B] dark:text-[#F87171]' : 'text-[#6B7280] dark:text-[#D1D5DB]/70'
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
          <div key={`empty-${i}`} className="w-8 h-8 sm:w-9 sm:h-9" />
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
                  ? 'bg-[#A68A64] text-[#F7F7F2] shadow-md shadow-[#A68A64]/30 font-black'
                  : isToday
                  ? 'ring-1 ring-[#A68A64] text-[#A68A64] bg-[#A68A64]/10 dark:bg-[#A68A64]/15'
                  : isFriday
                  ? 'text-[#C0564B] dark:text-[#F87171] hover:bg-[#C0564B]/10 dark:hover:bg-[#F87171]/15'
                  : 'text-[#1F2933] dark:text-[#F7F7F2] hover:bg-black/5 dark:hover:bg-white/10'
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* Quick Presets & Close Footer */}
      <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#6B7280]/15 dark:border-[#D1D5DB]/15 text-[11px] font-bold">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleSelectToday}
            className="px-2.5 py-1 rounded-xl bg-[#A68A64]/15 text-[#A68A64] hover:bg-[#A68A64] hover:text-[#F7F7F2] transition"
          >
            امروز
          </button>
          <button
            type="button"
            onClick={handleSelectYesterday}
            className="px-2.5 py-1 rounded-xl bg-black/5 dark:bg-white/5 text-[#6B7280] dark:text-[#D1D5DB] hover:bg-black/10 dark:hover:bg-white/10 transition"
          >
            دیروز
          </button>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="px-2.5 py-1 rounded-xl text-[#6B7280] hover:text-[#1F2933] dark:text-[#D1D5DB] dark:hover:text-white transition"
        >
          بستن
        </button>
      </div>
    </div>
  );

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-xs font-bold text-[#1F2933] dark:text-[#F7F7F2] mb-1.5">
          {label} {required && <span className="text-[#C0564B] dark:text-[#F87171]">*</span>}
        </label>
      )}

      {/* Input container */}
      <div className="relative flex items-center" ref={inputContainerRef}>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          onClick={() => !disabled && setIsOpen(true)}
          className={`w-full pr-9 pl-14 py-2.5 rounded-xl bg-[#F7F7F2] dark:bg-[#1F2933] border border-[#6B7280]/20 dark:border-[#D1D5DB]/20 text-xs font-bold font-mono text-[#1F2933] dark:text-[#F7F7F2] outline-none focus:ring-2 focus:ring-[#A68A64]/30 focus:border-[#A68A64] transition-[border-color,box-shadow] duration-150 cursor-pointer select-none ${inputClassName}`}
          readOnly
        />
        <div
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className="absolute right-3 text-[#6B7280] dark:text-[#D1D5DB] cursor-pointer hover:text-[#A68A64] transition-[color] duration-150"
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
          className="absolute left-2.5 px-2 py-0.5 text-[10px] rounded-lg bg-[#A68A64]/15 hover:bg-[#A68A64] text-[#A68A64] hover:text-[#F7F7F2] font-bold transition-[background-color,color] duration-150"
        >
          امروز
        </button>
      </div>

      {/* Portal-Rendered Calendar Popover with high Z-Index (Z-[120]) to prevent clipping */}
      {isOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          isMobile ? (
            // Centered Modal on Mobile
            <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60">
              <div
                className="fixed inset-0 -z-10"
                onClick={() => setIsOpen(false)}
              />
              {calendarPopoverContent}
            </div>
          ) : coords ? (
            // Desktop Anchored Popover
            <div
              className="fixed z-[120]"
              style={{
                top: coords.isAbove ? undefined : `${coords.top}px`,
                bottom: coords.isAbove ? `${window.innerHeight - coords.top}px` : undefined,
                right: `${Math.max(12, coords.right)}px`,
              }}
            >
              {calendarPopoverContent}
            </div>
          ) : null,
          document.body
        )}
    </div>
  );
};


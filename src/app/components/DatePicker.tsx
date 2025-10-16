// app/components/DatePicker.tsx

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { FaRegCalendarAlt } from 'react-icons/fa';

interface DatePickerProps {
  selectedDate: string;
  onDateSelect: (date: string) => void;
  resetToToday: () => void;
  availableDates: Set<number>;
}

export const DatePicker: React.FC<DatePickerProps> = ({ selectedDate, onDateSelect, resetToToday, availableDates }) => {
  const [isOpen, setIsOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  const handleDayClick = (date: Date | undefined) => {
    if (date) {
      onDateSelect(format(date, 'yyyy-MM-dd'));
      setIsOpen(false);
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [pickerRef]);

  const disabledDays = (date: Date) => {
    const normalizedDate = new Date(date).setHours(0, 0, 0, 0);
    return !availableDates.has(normalizedDate);
  };

  const lastAvailableDate = new Date(Math.max(...Array.from(availableDates)));

  return (
    <div className="relative" ref={pickerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-1 bg-gray-8 hover:rounded-[20px] rounded-[6px] focus:rounded-[20px] focus:outline-none transition-all"
      >
        <FaRegCalendarAlt />
        <span>{selectedDate === 'Hari Ini' ? 'Hari Ini' : format(new Date(selectedDate), 'dd MMMM yyyy', { locale: id })}</span>
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-2 bg-white border rounded-md shadow-lg">
          <DayPicker
            mode="single"
            selected={new Date(selectedDate)}
            onSelect={handleDayClick}
            locale={id}
            defaultMonth={lastAvailableDate}
            footer={
              <button
                onClick={() => {
                  resetToToday();
                  setIsOpen(false);
                }}
                className="w-full text-center py-2 text-sm text-blue-600 hover:bg-gray-100"
              >
                Kembali ke Hari Ini
              </button>
            }
          />
        </div>
      )}
    </div>
  );
};

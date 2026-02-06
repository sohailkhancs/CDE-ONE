import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, X } from 'lucide-react';

interface DatePickerProps {
    label?: string;
    value: string;
    onChange: (date: string) => void;
    placeholder?: string;
    required?: boolean;
    className?: string;
}

const DatePicker: React.FC<DatePickerProps> = ({
    label,
    value,
    onChange,
    placeholder = "Select date",
    required = false,
    className = ""
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [calendarDate, setCalendarDate] = useState(new Date());
    const containerRef = useRef<HTMLDivElement>(null);

    // Initialize calendar date from value prop or default to today
    useEffect(() => {
        if (value) {
            const date = new Date(value);
            if (!isNaN(date.getTime())) {
                setCalendarDate(date);
            }
        }
    }, [value]);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const getDaysInMonth = (year: number, month: number) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (year: number, month: number) => {
        return new Date(year, month, 1).getDay();
    };

    const handlePrevMonth = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1));
    };

    const handleNextMonth = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1));
    };

    const handleDayClick = (day: number) => {
        const selectedDate = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), day);
        // Format as YYYY-MM-DD for consistency with input[type="date"]
        const year = selectedDate.getFullYear();
        const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const dayStr = String(day).padStart(2, '0');

        onChange(`${year}-${month}-${dayStr}`);
        setIsOpen(false);
    };

    const formatDateDisplay = (dateStr: string) => {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        // Handle timezone issues ensuring we show the correct date
        // Create a date object treating the input string as local time
        // The value comes in as YYYY-MM-DD
        const [year, month, day] = dateStr.split('-').map(Number);
        const localDate = new Date(year, month - 1, day);

        return localDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const renderCalendar = () => {
        const year = calendarDate.getFullYear();
        const month = calendarDate.getMonth();
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);

        const days = [];

        // Empty slots for days before the 1st
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-8 w-8" />);
        }

        // Days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isSelected = value === dateStr;
            const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();

            days.push(
                <button
                    key={day}
                    type="button"
                    onClick={() => handleDayClick(day)}
                    className={`h-8 w-8 rounded-full text-xs font-semibold flex items-center justify-center transition-all duration-200
                        ${isSelected
                            ? 'bg-red-600 text-white shadow-md shadow-red-200'
                            : isToday
                                ? 'bg-red-50 text-red-600 font-bold'
                                : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                >
                    {day}
                </button>
            );
        }

        return days;
    };

    return (
        <div className={`space-y-2 ${className}`} ref={containerRef}>
            {label && (
                <label className="text-xs font-bold text-slate-700 block">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}

            <div className="relative">
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className={`w-full px-4 py-2.5 bg-slate-50 border rounded-lg text-sm flex items-center justify-between transition-all duration-200
                        ${isOpen
                            ? 'border-red-500 ring-2 ring-red-500/20 bg-white'
                            : 'border-slate-200 hover:border-slate-300'
                        }
                    `}
                >
                    <div className="flex items-center text-slate-700">
                        <CalendarIcon size={16} className={`mr-3 ${isOpen || value ? 'text-red-500' : 'text-slate-400'}`} />
                        {value ? (
                            <span className="font-medium text-slate-900">{formatDateDisplay(value)}</span>
                        ) : (
                            <span className="text-slate-400">{placeholder}</span>
                        )}
                    </div>
                </button>

                {/* Calendar Dropdown */}
                {isOpen && (
                    <div className="absolute top-full left-0 mt-2 p-4 bg-white rounded-xl shadow-xl border border-slate-100 z-50 w-72 animate-in fade-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-4">
                            <button
                                type="button"
                                onClick={handlePrevMonth}
                                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors"
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <div className="text-sm font-bold text-slate-800">
                                {months[calendarDate.getMonth()]} {calendarDate.getFullYear()}
                            </div>
                            <button
                                type="button"
                                onClick={handleNextMonth}
                                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>

                        {/* Weekday Headers */}
                        <div className="grid grid-cols-7 mb-2">
                            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                                <div key={day} className="h-8 w-8 flex items-center justify-center text-[10px] font-bold text-slate-400 uppercase">
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Calendar Grid */}
                        <div className="grid grid-cols-7 gap-y-1">
                            {renderCalendar()}
                        </div>

                        {/* shortcuts */}
                        <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between">
                            <button
                                type="button"
                                onClick={() => {
                                    const today = new Date();
                                    const year = today.getFullYear();
                                    const month = String(today.getMonth() + 1).padStart(2, '0');
                                    const day = String(today.getDate()).padStart(2, '0');
                                    onChange(`${year}-${month}-${day}`);
                                    setIsOpen(false);
                                }}
                                className="text-xs font-semibold text-red-600 hover:text-red-700 transition-colors"
                            >
                                Today
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    onChange('');
                                    setIsOpen(false);
                                }}
                                className="text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                Clear
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div >
    );
};

export default DatePicker;

import { useMemo } from 'react';

const weekdays = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];

type Props = {
  value: string;
  onChange: (value: string) => void;
  availableWeekdays?: number[];
};

const Calendar = ({ value, onChange, availableWeekdays }: Props) => {
  const minDate = useMemo(() => new Date().toISOString().split('T')[0], []);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const next = event.target.value;
    if (!next) return;
    if (availableWeekdays) {
      const weekday = new Date(next + 'T00:00').getDay();
      if (!availableWeekdays.includes(weekday)) {
        return;
      }
    }
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="booking-date" className="text-sm font-medium text-slate-500 dark:text-slate-300">
        Datum wählen
      </label>
      <input
        id="booking-date"
        type="date"
        value={value}
        min={minDate}
        onChange={handleChange}
        aria-label="Datum für den Termin auswählen"
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-inner focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
      />
      {availableWeekdays && (
        <p className="text-xs text-slate-400">Verfügbare Tage: {availableWeekdays.map((day) => weekdays[day]).join(', ')}</p>
      )}
    </div>
  );
};

export default Calendar;

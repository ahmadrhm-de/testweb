import { motion } from 'framer-motion';

type TimeSlot = {
  value: string;
  label?: string;
};

type TimeGridProps = {
  slots: TimeSlot[];
  selected?: string;
  onSelect: (value: string) => void;
};

const TimeGrid = ({ slots, selected, onSelect }: TimeGridProps) => (
  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
    {slots.map((slot) => {
      const isSelected = slot.value === selected;
      return (
        <motion.button
          key={slot.value + slot.label}
          whileTap={{ scale: 0.97 }}
          type="button"
          onClick={() => onSelect(slot.value)}
          className={`rounded-xl border px-4 py-3 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-brand/40 ${
            isSelected
              ? 'border-brand bg-brand text-white shadow-lg shadow-brand/30'
              : 'border-slate-200 bg-white text-slate-700 hover:border-brand hover:text-brand dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100'
          }`}
        >
          <span>{new Date(slot.value).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}</span>
          {slot.label && <span className="block text-xs opacity-80">{slot.label}</span>}
        </motion.button>
      );
    })}
  </div>
);

export default TimeGrid;

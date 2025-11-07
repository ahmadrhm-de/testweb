import { motion } from 'framer-motion';

type StepperProps = {
  steps: string[];
  activeIndex: number;
};

const Stepper = ({ steps, activeIndex }: StepperProps) => (
  <div className="flex w-full items-center gap-4">
    {steps.map((step, index) => {
      const active = index <= activeIndex;
      return (
        <div key={step} className="flex flex-1 items-center gap-2">
          <motion.span
            layout
            className={`flex h-8 w-8 items-center justify-center rounded-full border text-sm font-semibold transition ${
              active ? 'border-brand bg-brand text-white' : 'border-slate-300 bg-white text-slate-500 dark:border-slate-700 dark:bg-slate-900'
            }`}
          >
            {index + 1}
          </motion.span>
          <span className={`text-xs uppercase tracking-wide ${active ? 'text-brand' : 'text-slate-400'}`}>{step}</span>
          {index < steps.length - 1 && (
            <motion.span layout className={`h-px flex-1 ${active ? 'bg-brand' : 'bg-slate-200 dark:bg-slate-800'}`} />
          )}
        </div>
      );
    })}
  </div>
);

export default Stepper;

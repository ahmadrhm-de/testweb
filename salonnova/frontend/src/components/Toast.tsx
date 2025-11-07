import { AnimatePresence, motion } from 'framer-motion';

type ToastProps = {
  message: string | null;
  type?: 'success' | 'error';
  onClose: () => void;
};

const colors = {
  success: 'bg-emerald-500',
  error: 'bg-rose-500'
};

const Toast = ({ message, type = 'success', onClose }: ToastProps) => (
  <AnimatePresence>
    {message && (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 16 }}
        className={`fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full px-5 py-3 text-sm text-white shadow-lg ${colors[type]}`}
        role="alert"
      >
        <div className="flex items-center gap-3">
          <span>{message}</span>
          <button onClick={onClose} className="text-white/80 hover:text-white" aria-label="Benachrichtigung schließen">
            ×
          </button>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

export default Toast;

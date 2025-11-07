import { useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Confirm = () => {
  const location = useLocation();
  const state = location.state as
    | {
        bookingId: number;
        startsAt: string;
        staff: { name: string };
        service: { name: string };
      }
    | undefined;

  return (
    <div className="mx-auto max-w-3xl px-4 py-24 text-center">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 rounded-3xl bg-white/80 p-10 shadow-xl dark:bg-slate-900/80">
        <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-3xl text-white shadow-lg">✓</span>
        <h1 className="text-3xl font-semibold">Termin bestätigt!</h1>
        {state ? (
          <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
            <p>Buchungsnummer: <strong>#{state.bookingId}</strong></p>
            <p>Leistung: <strong>{state.service.name}</strong></p>
            <p>Stylist: <strong>{state.staff.name}</strong></p>
            <p>Zeitpunkt: <strong>{new Date(state.startsAt).toLocaleString('de-DE')}</strong></p>
            <p className="text-xs text-slate-400">Eine Bestätigung wurde an Ihre E-Mail gesendet.</p>
          </div>
        ) : (
          <p className="text-sm text-slate-500">
            Ihr Termin ist bestätigt. Bei Fragen kontaktieren Sie uns bitte telefonisch.
          </p>
        )}
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link to="/" className="rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white shadow hover:bg-brand-dark">
            Zur Startseite
          </Link>
          <Link to="/buchen" className="rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 hover:border-brand hover:text-brand dark:border-slate-700 dark:text-slate-100">
            Weitere Buchung
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Confirm;

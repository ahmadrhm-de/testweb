import { Link, NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';

type Props = {
  dark: boolean;
  onToggleTheme: () => void;
};

const NavBar = ({ dark, onToggleTheme }: Props) => {
  const navItems = [
    { to: '/', label: 'Start' },
    { to: '/buchen', label: 'Termin buchen' },
    { to: '/admin', label: 'Admin' }
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/20 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2 text-lg font-semibold">
          <motion.span initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-brand text-white">
            SN
          </motion.span>
          <span>SalonNova</span>
        </Link>
        <div className="flex items-center gap-4">
          <div className="hidden items-center gap-4 md:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `relative text-sm font-medium transition hover:text-brand ${isActive ? 'text-brand' : ''}`
                }
              >
                {({ isActive }) => (
                  <span className="inline-flex items-center gap-2">
                    {item.label}
                    {isActive && (
                      <motion.span
                        layoutId="nav-underline"
                        className="h-0.5 w-full bg-brand"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      />
                    )}
                  </span>
                )}
              </NavLink>
            ))}
          </div>
          <Link
            to="/buchen"
            className="hidden rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-brand/30 transition hover:bg-brand-dark md:inline-flex"
          >
            Termin buchen
          </Link>
          <button
            onClick={onToggleTheme}
            aria-label="Farbmodus wechseln"
            className="rounded-full border border-slate-200 bg-white/70 p-2 text-slate-700 shadow-inner transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          >
            {dark ? '🌙' : '☀️'}
          </button>
        </div>
      </nav>
    </header>
  );
};

export default NavBar;

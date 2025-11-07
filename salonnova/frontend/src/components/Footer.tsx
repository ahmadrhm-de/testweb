const Footer = () => (
  <footer className="border-t border-white/10 bg-white/80 py-8 text-sm text-slate-500 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
    <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-center md:flex-row md:text-left">
      <p>&copy; {new Date().getFullYear()} SalonNova. Alle Rechte vorbehalten.</p>
      <nav className="flex gap-4">
        <a href="#leistungen" className="hover:text-brand">Leistungen</a>
        <a href="#team" className="hover:text-brand">Team</a>
        <a href="#kontakt" className="hover:text-brand">Kontakt</a>
      </nav>
    </div>
  </footer>
);

export default Footer;

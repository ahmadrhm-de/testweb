import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import ServiceCard from '../components/ServiceCard';
import { getOpeningHours, getServices, getStaff } from '../lib/api';
import { t } from '../lib/i18n';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 }
};

type Service = {
  id: number;
  name: string;
  durationMin: number;
  priceCents: number;
};

type Staff = {
  id: number;
  name: string;
  bio: string;
};

type OpeningHour = {
  weekday: number;
  open: string;
  close: string;
};

const weekdayLabels = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];

const Home = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [team, setTeam] = useState<Staff[]>([]);
  const [openingHours, setOpeningHours] = useState<OpeningHour[]>([]);

  useEffect(() => {
    getServices().then(setServices).catch(console.error);
    getStaff().then(setTeam).catch(console.error);
    getOpeningHours().then(setOpeningHours).catch(console.error);
  }, []);

  return (
    <div className="space-y-24 pb-24">
      <section className="relative overflow-hidden bg-gradient-to-br from-rose-100 via-white to-amber-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-10 px-4 py-24 md:flex-row md:py-32">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            transition={{ duration: 0.6 }}
            className="flex-1 space-y-6"
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-brand shadow-sm dark:bg-slate-900/70">
              SalonNova Experience
            </span>
            <h1 className="text-4xl font-bold leading-tight md:text-5xl">{t('heroHeadline')}</h1>
            <p className="text-lg text-slate-600 dark:text-slate-300">{t('heroSubline')}</p>
            <div className="flex flex-wrap gap-3">
              <a
                href="/buchen"
                className="inline-flex items-center rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand/30 transition hover:bg-brand-dark"
              >
                {t('cta')}
              </a>
              <a
                href="#leistungen"
                className="inline-flex items-center rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-brand hover:text-brand dark:border-slate-700 dark:text-slate-100"
              >
                Leistungen entdecken
              </a>
            </div>
          </motion.div>
          <motion.img
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            src="/images/hero.svg"
            alt="SalonNova Studio"
            className="w-full max-w-md rounded-3xl object-cover shadow-2xl shadow-rose-200/60"
            loading="lazy"
          />
        </div>
      </section>

      <section id="leistungen" className="mx-auto max-w-6xl space-y-12 px-4">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="space-y-3 text-center">
          <h2 className="text-3xl font-semibold">{t('services')}</h2>
          <p className="text-slate-500 dark:text-slate-300">
            Maßgeschneiderte Treatments für gesundes, glänzendes Haar – jedes Detail perfekt abgestimmt.
          </p>
        </motion.div>
        <motion.div
          className="grid gap-6 md:grid-cols-2 xl:grid-cols-4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        >
          {services.map((service, index) => (
            <motion.div key={service.id} variants={fadeUp}>
              <ServiceCard
                title={service.name}
                description="Individuelle Beratung und Premium-Produkte inklusive."
                duration={`${service.durationMin} Min.`}
                price={`${(service.priceCents / 100).toFixed(2)} €`}
                image={`/images/service-${(index % 4) + 1}.svg`}
              />
            </motion.div>
          ))}
        </motion.div>
      </section>

      <section id="team" className="mx-auto max-w-6xl space-y-12 px-4">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="space-y-3 text-center">
          <h2 className="text-3xl font-semibold">{t('team')}</h2>
          <p className="text-slate-500 dark:text-slate-300">Persönlichkeiten mit Stilgefühl, Expertise und Feingefühl.</p>
        </motion.div>
        <div className="grid gap-6 md:grid-cols-3">
          {team.map((member, index) => (
            <motion.div
              key={member.id}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="rounded-3xl border border-white/20 bg-white/70 p-6 text-center shadow-lg dark:border-slate-800 dark:bg-slate-900/70"
            >
              <img
                src={`/images/team-${(index % 3) + 1}.svg`}
                alt={member.name}
                className="mx-auto h-40 w-40 rounded-full object-cover"
                loading="lazy"
              />
              <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">{member.name}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-300">{member.bio}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section id="galerie" className="mx-auto max-w-6xl space-y-12 px-4">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="space-y-3 text-center">
          <h2 className="text-3xl font-semibold">{t('gallery')}</h2>
          <p className="text-slate-500 dark:text-slate-300">Einblicke in unsere Styling-Welt.</p>
        </motion.div>
        <motion.div
          className="grid grid-cols-2 gap-4 md:grid-cols-3"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
        >
          {Array.from({ length: 6 }).map((_, index) => (
            <motion.img
              key={index}
              variants={fadeUp}
              src={`/images/gallery-${index + 1}.svg`}
              alt={`SalonNova Galerie ${index + 1}`}
              className="h-48 w-full rounded-3xl object-cover shadow-md"
              loading="lazy"
            />
          ))}
        </motion.div>
      </section>

      <section id="kontakt" className="mx-auto max-w-6xl space-y-12 px-4">
        <div className="grid gap-10 lg:grid-cols-2">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="space-y-6">
            <h2 className="text-3xl font-semibold">{t('openingHours')}</h2>
            <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
              {openingHours.map((item) => (
                <li key={item.weekday} className="flex items-center justify-between rounded-2xl bg-white/60 px-4 py-3 shadow-sm dark:bg-slate-900/70">
                  <span>{weekdayLabels[item.weekday]}</span>
                  <span>
                    {item.open} – {item.close}
                  </span>
                </li>
              ))}
            </ul>
          </motion.div>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="space-y-6"
          >
            <h2 className="text-3xl font-semibold">{t('location')}</h2>
            <div className="glass rounded-3xl p-6 shadow-xl">
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Musterstraße 12, 10115 Berlin
                <br />
                Telefon: <a href="tel:+4930123456" className="text-brand">+49 30 123 456</a>
              </p>
              <div className="mt-4 h-64 w-full overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-br from-rose-200 to-amber-200 text-slate-700 shadow-inner dark:border-slate-700 dark:from-slate-800 dark:to-slate-900">
                <div className="flex h-full flex-col items-center justify-center gap-2">
                  <span className="text-lg font-semibold">Kartenansicht</span>
                  <span className="text-xs text-slate-500">Hier könnte eine eingebettete Karte platziert werden.</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;

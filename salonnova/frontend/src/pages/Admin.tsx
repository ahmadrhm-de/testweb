import { useEffect, useMemo, useState } from 'react';
import { format, startOfWeek, addDays } from 'date-fns';
import { de } from 'date-fns/locale';
import { motion } from 'framer-motion';
import Toast from '../components/Toast';
import { adminClient, getOpeningHours, getServices, getStaff } from '../lib/api';

type Booking = {
  id: number;
  startsAt: string;
  endsAt: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  status: string;
  service: { id: number; name: string };
  staff: { id: number; name: string };
};

type Service = {
  id: number;
  name: string;
  durationMin: number;
  priceCents: number;
  active: boolean;
};

type Staff = {
  id: number;
  name: string;
  bio: string;
  services: { id: number }[];
};

type OpeningHour = {
  weekday: number;
  open: string;
  close: string;
};

const Admin = () => {
  const [password, setPassword] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServicesState] = useState<Service[]>([]);
  const [staff, setStaffState] = useState<Staff[]>([]);
  const [openingHours, setOpeningHoursState] = useState<OpeningHour[]>([]);
  const [viewDate, setViewDate] = useState(new Date());
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'error' } | null>(null);
  const [loading, setLoading] = useState(false);

  const adminApi = useMemo(() => (token ? adminClient(token) : null), [token]);

  const loadProtectedData = async () => {
    if (!adminApi) return;
    try {
      setLoading(true);
      const [bookingsRes, servicesRes, staffRes, openingRes] = await Promise.all([
        adminApi.get('/bookings'),
        adminApi.get('/services'),
        adminApi.get('/staff'),
        adminApi.get('/opening-hours')
      ]);
      setBookings(bookingsRes.data);
      setServicesState(servicesRes.data);
      setStaffState(staffRes.data);
      setOpeningHoursState(openingRes.data);
    } catch (error: any) {
      const message = error?.response?.data?.error ?? 'Admin-Daten konnten nicht geladen werden';
      setToast({ message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadProtectedData();
    }
  }, [token]);

  useEffect(() => {
    // preload public data for forms
    getServices().then(setServicesState).catch(() => undefined);
    getStaff().then(setStaffState).catch(() => undefined);
    getOpeningHours().then(setOpeningHoursState).catch(() => undefined);
  }, []);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const client = adminClient(password);
      await client.get('/services');
      setToken(password);
      setToast({ message: 'Erfolgreich angemeldet', type: 'success' });
    } catch (error) {
      setToast({ message: 'Anmeldung fehlgeschlagen', type: 'error' });
    }
  };

  const handleCreateService = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!adminApi) return;
    const formData = new FormData(event.currentTarget);
    try {
      await adminApi.post('/services', {
        name: formData.get('name'),
        durationMin: Number(formData.get('durationMin')),
        priceCents: Number(formData.get('priceCents')),
        active: true
      });
      event.currentTarget.reset();
      loadProtectedData();
      setToast({ message: 'Service angelegt', type: 'success' });
    } catch (error: any) {
      const message = error?.response?.data?.error ?? 'Service konnte nicht angelegt werden';
      setToast({ message, type: 'error' });
    }
  };

  const handleCreateStaff = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!adminApi) return;
    const formData = new FormData(event.currentTarget);
    try {
      await adminApi.post('/staff', {
        name: formData.get('name'),
        bio: formData.get('bio'),
        serviceIds: formData
          .getAll('serviceIds')
          .map((value) => Number(value))
          .filter(Boolean)
      });
      event.currentTarget.reset();
      loadProtectedData();
      setToast({ message: 'Mitarbeiter:in angelegt', type: 'success' });
    } catch (error: any) {
      const message = error?.response?.data?.error ?? 'Mitarbeiter:in konnte nicht angelegt werden';
      setToast({ message, type: 'error' });
    }
  };

  const handleOpeningUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!adminApi) return;
    const formData = new FormData(event.currentTarget);
    try {
      await adminApi.post('/opening-hours', {
        weekday: Number(formData.get('weekday')),
        open: formData.get('open'),
        close: formData.get('close')
      });
      loadProtectedData();
      setToast({ message: 'Öffnungszeiten aktualisiert', type: 'success' });
    } catch (error: any) {
      const message = error?.response?.data?.error ?? 'Öffnungszeiten konnten nicht gespeichert werden';
      setToast({ message, type: 'error' });
    }
  };

  const weeklyBookings = useMemo(() => {
    const start = startOfWeek(viewDate, { weekStartsOn: 1 });
    return Array.from({ length: 7 }).map((_, index) => {
      const day = addDays(start, index);
      return {
        date: day,
        entries: bookings.filter((booking) => format(new Date(booking.startsAt), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd'))
      };
    });
  }, [bookings, viewDate]);

  if (!token) {
    return (
      <div className="mx-auto flex max-w-sm flex-col gap-6 px-4 py-24">
        <h1 className="text-3xl font-semibold">Admin Login</h1>
        <form onSubmit={handleLogin} className="space-y-4 rounded-3xl bg-white/80 p-6 shadow-lg dark:bg-slate-900/80">
          <label className="flex flex-col gap-2 text-sm">
            <span>Passwort</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-inner focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/40 dark:border-slate-700 dark:bg-slate-900"
            />
          </label>
          <button type="submit" className="w-full rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white">
            Anmelden
          </button>
        </form>
        <Toast message={toast?.message ?? null} type={toast?.type} onClose={() => setToast(null)} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-12 px-4 py-16">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Admin-Dashboard</h1>
          <p className="text-sm text-slate-500">Verwalten Sie Leistungen, Team und Termine.</p>
        </div>
        <div className="flex gap-3">
          <input
            type="date"
            value={format(viewDate, 'yyyy-MM-dd')}
            onChange={(event) => setViewDate(new Date(event.target.value))}
            className="rounded-full border border-slate-200 px-4 py-2 text-sm dark:border-slate-700"
          />
          <button onClick={loadProtectedData} className="rounded-full border px-4 py-2 text-sm">
            Aktualisieren
          </button>
        </div>
      </div>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Wochenübersicht</h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {weeklyBookings.map((day) => (
            <motion.div key={day.date.toISOString()} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-white/10 bg-white/80 p-4 shadow dark:border-slate-800 dark:bg-slate-900/70">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                {format(day.date, 'EEEE, dd.MM.', { locale: de })}
              </h3>
              <ul className="mt-3 space-y-3">
                {day.entries.length ? (
                  day.entries.map((booking) => (
                    <li key={booking.id} className="rounded-2xl bg-white/70 p-3 text-xs text-slate-600 shadow-sm dark:bg-slate-950/50 dark:text-slate-200">
                      <div className="font-semibold text-slate-800 dark:text-white">
                        {format(new Date(booking.startsAt), 'HH:mm')} – {booking.service.name}
                      </div>
                      <div>Kund:in: {booking.customerName}</div>
                      <div>Stylist: {booking.staff.name}</div>
                    </li>
                  ))
                ) : (
                  <li className="rounded-2xl bg-white/60 p-3 text-xs text-slate-400 shadow-inner dark:bg-slate-950/30">
                    Keine Termine
                  </li>
                )}
              </ul>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Service-Verwaltung</h2>
          <form onSubmit={handleCreateService} className="space-y-4 rounded-3xl bg-white/80 p-6 shadow dark:bg-slate-900/80">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm">
                Name
                <input name="name" className="mt-1 w-full rounded-xl border px-3 py-2" required />
              </label>
              <label className="text-sm">
                Dauer (Minuten)
                <input name="durationMin" type="number" className="mt-1 w-full rounded-xl border px-3 py-2" required />
              </label>
              <label className="text-sm">
                Preis (Cent)
                <input name="priceCents" type="number" className="mt-1 w-full rounded-xl border px-3 py-2" required />
              </label>
            </div>
            <button type="submit" className="rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white">
              Service anlegen
            </button>
          </form>
          <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
            {services.map((service) => (
              <li key={service.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/70 px-4 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
                <span>
                  {service.name} · {service.durationMin} Min · {(service.priceCents / 100).toFixed(2)} €
                </span>
                {adminApi && (
                  <button
                    onClick={async () => {
                      try {
                        await adminApi.delete(`/services/${service.id}`);
                        loadProtectedData();
                        setToast({ message: 'Service entfernt', type: 'success' });
                      } catch (error: any) {
                        const message = error?.response?.data?.error ?? 'Service konnte nicht gelöscht werden';
                        setToast({ message, type: 'error' });
                      }
                    }}
                    className="text-xs text-rose-500"
                  >
                    Löschen
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Team-Verwaltung</h2>
          <form onSubmit={handleCreateStaff} className="space-y-4 rounded-3xl bg-white/80 p-6 shadow dark:bg-slate-900/80">
            <label className="text-sm">
              Name
              <input name="name" className="mt-1 w-full rounded-xl border px-3 py-2" required />
            </label>
            <label className="text-sm">
              Kurzprofil
              <textarea name="bio" className="mt-1 w-full rounded-xl border px-3 py-2" rows={3} required />
            </label>
            <label className="text-sm">
              Leistungen
              <select name="serviceIds" multiple className="mt-1 w-full rounded-xl border px-3 py-2">
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name}
                  </option>
                ))}
              </select>
            </label>
            <button type="submit" className="rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white">
              Teammitglied anlegen
            </button>
          </form>
          <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
            {staff.map((member) => (
              <li key={member.id} className="rounded-2xl border border-white/10 bg-white/70 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
                <div className="font-semibold text-slate-800 dark:text-white">{member.name}</div>
                <p className="text-xs text-slate-500 dark:text-slate-300">{member.bio}</p>
                <div className="mt-2 text-xs uppercase tracking-wide text-slate-400">
                  {member.services.map((service) => services.find((s) => s.id === service.id)?.name).join(', ')}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Öffnungszeiten</h2>
        <form onSubmit={handleOpeningUpdate} className="grid gap-4 rounded-3xl bg-white/80 p-6 shadow md:grid-cols-4 dark:bg-slate-900/80">
          <label className="text-sm">
            Wochentag (0=So)
            <input name="weekday" type="number" min={0} max={6} className="mt-1 w-full rounded-xl border px-3 py-2" required />
          </label>
          <label className="text-sm">
            Öffnet
            <input name="open" placeholder="09:00" className="mt-1 w-full rounded-xl border px-3 py-2" required />
          </label>
          <label className="text-sm">
            Schließt
            <input name="close" placeholder="18:00" className="mt-1 w-full rounded-xl border px-3 py-2" required />
          </label>
          <div className="flex items-end">
            <button type="submit" className="w-full rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white">
              Speichern
            </button>
          </div>
        </form>
        <ul className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
          {openingHours.map((entry) => (
            <li key={entry.weekday} className="rounded-2xl border border-white/10 bg-white/70 px-4 py-3 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
              Tag {entry.weekday}: {entry.open} – {entry.close}
            </li>
          ))}
        </ul>
      </section>

      <Toast message={toast?.message ?? null} type={toast?.type} onClose={() => setToast(null)} />
      {loading && <div className="text-sm text-slate-400">Lade Daten …</div>}
    </div>
  );
};

export default Admin;

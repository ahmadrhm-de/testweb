import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Stepper from '../components/Stepper';
import Calendar from '../components/Calendar';
import TimeGrid from '../components/TimeGrid';
import Toast from '../components/Toast';
import { createBooking, getAvailability, getOpeningHours, getServices, getStaff } from '../lib/api';

const customerSchema = z.object({
  name: z.string().min(2, 'Bitte Namen angeben'),
  email: z.string().email('Bitte gültige E-Mail eintragen'),
  phone: z.string().min(6, 'Telefonnummer benötigt'),
  notes: z.string().max(500).optional()
});

type CustomerForm = z.infer<typeof customerSchema>;

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
  services: { id: number }[];
};

type Availability = {
  staffId: number;
  slots: { start: string; end: string }[];
};

const steps = ['Service', 'Stylist', 'Datum', 'Zeit', 'Details'];

const Booking = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [openingHours, setOpeningHours] = useState<{ weekday: number }[]>([]);
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [selectedService, setSelectedService] = useState<number | null>(null);
  const [preferredStaff, setPreferredStaff] = useState<number | null>(null);
  const [assignedStaff, setAssignedStaff] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'error' } | null>(null);

  const navigate = useNavigate();

  const form = useForm<CustomerForm>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      notes: ''
    }
  });

  useEffect(() => {
    getServices().then(setServices).catch(console.error);
    getStaff().then(setStaff).catch(console.error);
    getOpeningHours().then(setOpeningHours).catch(console.error);
  }, []);

  useEffect(() => {
    if (preferredStaff) {
      setAssignedStaff(preferredStaff);
    } else if (step < 3) {
      setAssignedStaff(null);
    }
  }, [preferredStaff, step]);


  useEffect(() => {
    setSelectedSlot('');
    if (preferredStaff) {
      setAssignedStaff(preferredStaff);
    }
  }, [selectedDate, preferredStaff]);
  useEffect(() => {
    if (selectedService && selectedDate) {
      setLoading(true);
      getAvailability({ serviceId: selectedService, staffId: preferredStaff ?? undefined, date: selectedDate })
        .then((data) => {
          setAvailability(data);
          if (preferredStaff && data.every((item) => item.slots.length === 0)) {
            setToast({ message: 'Keine Termine verfügbar, bitte anderes Datum wählen', type: 'error' });
          }
        })
        .catch(() => setToast({ message: 'Fehler bei der Verfügbarkeitsabfrage', type: 'error' }))
        .finally(() => setLoading(false));
    }
  }, [selectedService, selectedDate, preferredStaff]);

  const filteredStaff = useMemo(() => {
    if (!selectedService) return staff;
    return staff.filter((member) => member.services.some((service) => service.id === selectedService));
  }, [staff, selectedService]);

  const staffById = useMemo(() => {
    const map = new Map<number, Staff>();
    staff.forEach((member) => map.set(member.id, member));
    return map;
  }, [staff]);

  const slotsForPreferredStaff = useMemo(() => {
    if (!preferredStaff) return [];
    const entry = availability.find((item) => item.staffId === preferredStaff);
    return entry?.slots.map((slot) => ({ value: slot.start })) ?? [];
  }, [availability, preferredStaff]);

  const slotOptions = useMemo(() => {
    if (preferredStaff) {
      return slotsForPreferredStaff;
    }
    return availability.flatMap((item) =>
      item.slots.map((slot) => ({
        value: slot.start,
        label: staffById.get(item.staffId)?.name ?? 'Team'
      }))
    );
  }, [availability, preferredStaff, slotsForPreferredStaff, staffById]);

  const availableWeekdays = useMemo(() => openingHours.map((item) => item.weekday), [openingHours]);

  const nextStep = () => setStep((prev) => Math.min(prev + 1, steps.length - 1));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 0));

  const resetAfterService = () => {
    setPreferredStaff(null);
    setAssignedStaff(null);
    setSelectedDate('');
    setSelectedSlot('');
    setStep(1);
  };

  const handleBooking = async (values: CustomerForm) => {
    if (!selectedService || !assignedStaff || !selectedSlot) return;
    try {
      setLoading(true);
      const booking = await createBooking({
        serviceId: selectedService,
        staffId: assignedStaff,
        startsAt: selectedSlot,
        notes: values.notes,
        customer: {
          name: values.name,
          email: values.email,
          phone: values.phone
        }
      });
      navigate('/bestaetigt', {
        state: {
          bookingId: booking.id,
          startsAt: booking.startsAt,
          staff: booking.staff,
          service: booking.service
        }
      });
    } catch (error: any) {
      const message = error?.response?.data?.error ?? 'Buchung fehlgeschlagen';
      setToast({ message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-12 px-4 py-16">
      <div className="space-y-6">
        <h1 className="text-3xl font-semibold">Termin buchen</h1>
        <Stepper steps={steps} activeIndex={step} />
      </div>

      <div className="space-y-10">
        {step === 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="grid gap-4 sm:grid-cols-2">
            {services.map((service) => (
              <button
                key={service.id}
                onClick={() => {
                  setSelectedService(service.id);
                  resetAfterService();
                }}
                className={`rounded-3xl border px-6 py-5 text-left transition focus:outline-none focus:ring-2 focus:ring-brand/40 ${
                  selectedService === service.id
                    ? 'border-brand bg-brand text-white shadow-lg shadow-brand/30'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-brand dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100'
                }`}
              >
                <span className="text-lg font-semibold">{service.name}</span>
                <div className="mt-2 text-sm opacity-80">
                  Dauer: {service.durationMin} Min · Preis: {(service.priceCents / 100).toFixed(2)} €
                </div>
              </button>
            ))}
          </motion.div>
        )}

        {step === 1 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="grid gap-4 sm:grid-cols-2">
            {filteredStaff.map((member) => (
              <button
                key={member.id}
                onClick={() => {
                  setPreferredStaff(member.id);
                  setAssignedStaff(member.id);
                  setStep(2);
                }}
                className={`rounded-3xl border px-6 py-5 text-left transition focus:outline-none focus:ring-2 focus:ring-brand/40 ${
                  preferredStaff === member.id
                    ? 'border-brand bg-brand text-white shadow-lg shadow-brand/30'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-brand dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100'
                }`}
              >
                <span className="text-lg font-semibold">{member.name}</span>
                <p className="mt-2 text-sm opacity-80">{member.bio}</p>
              </button>
            ))}
            <button
              onClick={() => {
                setPreferredStaff(null);
                setAssignedStaff(null);
                setStep(2);
              }}
              className={`rounded-3xl border border-dashed px-6 py-5 text-left text-sm transition hover:border-brand hover:text-brand ${
                preferredStaff === null ? 'border-brand text-brand' : 'border-slate-200 text-slate-500 dark:border-slate-700'
              }`}
            >
              Keine Präferenz
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-sm">
            <Calendar value={selectedDate} onChange={setSelectedDate} availableWeekdays={availableWeekdays} />
            <div className="mt-6 flex gap-3">
              <button onClick={prevStep} className="rounded-full border px-4 py-2 text-sm">Zurück</button>
              <button
                onClick={() => selectedDate && setStep(3)}
                disabled={!selectedDate}
                className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                Weiter
              </button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {slotOptions.length ? (
              <TimeGrid
                slots={slotOptions}
                selected={selectedSlot}
                onSelect={(slot) => {
                  setSelectedSlot(slot);
                  const relatedStaff = availability.find((entry) => entry.slots.some((item) => item.start === slot));
                  if (!preferredStaff && relatedStaff) {
                    setAssignedStaff(relatedStaff.staffId);
                  }
                  setStep(4);
                }}
              />
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-300">Keine freien Termine für diesen Tag.</p>
            )}
            <div className="flex gap-3">
              <button onClick={prevStep} className="rounded-full border px-4 py-2 text-sm">Zurück</button>
              <button
                onClick={() => selectedSlot && setStep(4)}
                disabled={!selectedSlot}
                className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                Weiter
              </button>
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.form
            onSubmit={form.handleSubmit(handleBooking)}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label htmlFor="name" className="text-sm font-medium text-slate-500 dark:text-slate-300">
                  Vollständiger Name
                </label>
                <input
                  id="name"
                  {...form.register('name')}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-inner focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/40 dark:border-slate-700 dark:bg-slate-900"
                />
                {form.formState.errors.name && (
                  <span className="text-xs text-rose-500">{form.formState.errors.name.message}</span>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="email" className="text-sm font-medium text-slate-500 dark:text-slate-300">
                  E-Mail
                </label>
                <input
                  id="email"
                  {...form.register('email')}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-inner focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/40 dark:border-slate-700 dark:bg-slate-900"
                />
                {form.formState.errors.email && (
                  <span className="text-xs text-rose-500">{form.formState.errors.email.message}</span>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="phone" className="text-sm font-medium text-slate-500 dark:text-slate-300">
                  Telefon
                </label>
                <input
                  id="phone"
                  {...form.register('phone')}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-inner focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/40 dark:border-slate-700 dark:bg-slate-900"
                />
                {form.formState.errors.phone && (
                  <span className="text-xs text-rose-500">{form.formState.errors.phone.message}</span>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="notes" className="text-sm font-medium text-slate-500 dark:text-slate-300">
                  Notizen
                </label>
                <textarea
                  id="notes"
                  rows={4}
                  {...form.register('notes')}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-inner focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/40 dark:border-slate-700 dark:bg-slate-900"
                />
                {form.formState.errors.notes && (
                  <span className="text-xs text-rose-500">{form.formState.errors.notes.message}</span>
                )}
              </div>
            </div>
            <div className="flex justify-between">
              <button type="button" onClick={prevStep} className="rounded-full border px-4 py-2 text-sm">
                Zurück
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white disabled:opacity-60"
              >
                Termin bestätigen
              </button>
            </div>
          </motion.form>
        )}
      </div>

      <Toast message={toast?.message ?? null} type={toast?.type} onClose={() => setToast(null)} />
    </div>
  );
};

export default Booking;

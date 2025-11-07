import { Router } from 'express';
import { addMinutes, isBefore } from 'date-fns';
import { z } from 'zod';
import { prisma } from '../prismaClient';
import { requireAdmin } from './utils';
import { getAvailability } from '../logic/availability';
import { sendBookingNotifications } from '../logic/mailer';

const customerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(6)
});

const createBookingSchema = z.object({
  serviceId: z.number().int(),
  staffId: z.number().int(),
  startsAt: z.string().refine((value) => !Number.isNaN(Date.parse(value)), 'Ungültiges Datum'),
  notes: z.string().max(500).optional(),
  customer: customerSchema
});

const updateSchema = z.object({
  status: z.string().optional(),
  notes: z.string().optional()
});

const router = Router();

router.get('/', requireAdmin, async (req, res) => {
  const day = req.query.day ? new Date(String(req.query.day)) : undefined;
  const where = day
    ? {
        startsAt: {
          gte: new Date(day.setHours(0, 0, 0, 0)),
          lte: new Date(day.setHours(23, 59, 59, 999))
        }
      }
    : {};
  const bookings = await prisma.booking.findMany({
    where,
    include: { service: true, staff: true },
    orderBy: { startsAt: 'asc' }
  });
  res.json(bookings);
});

router.post('/', async (req, res, next) => {
  try {
    const parsed = createBookingSchema.parse(req.body);
    const startsAt = new Date(parsed.startsAt);

    const service = await prisma.service.findFirst({
      where: { id: parsed.serviceId, active: true },
      include: { staff: { select: { id: true, name: true } } }
    });

    if (!service) {
      return res.status(404).json({ error: 'Service nicht verfügbar' });
    }

    const staff = service.staff.find((s) => s.id === parsed.staffId);
    if (!staff) {
      return res.status(400).json({ error: 'Stylist kann Service nicht ausführen' });
    }

    const availability = await getAvailability({
      serviceId: service.id,
      staffId: parsed.staffId,
      date: new Date(startsAt.toDateString())
    });

    const staffAvailability = availability.find((a) => a.staffId === parsed.staffId);
    const slotMatch = staffAvailability?.slots.find((slot) => slot.start === startsAt.toISOString());
    if (!slotMatch) {
      return res.status(409).json({ error: 'Zeitslot ist nicht mehr verfügbar' });
    }

    const endsAt = addMinutes(startsAt, service.durationMin);
    if (isBefore(endsAt, startsAt)) {
      return res.status(400).json({ error: 'Ungültige Zeitangaben' });
    }

    const booking = await prisma.booking.create({
      data: {
        serviceId: service.id,
        staffId: parsed.staffId,
        startsAt,
        endsAt,
        customerName: parsed.customer.name,
        customerEmail: parsed.customer.email,
        customerPhone: parsed.customer.phone,
        notes: parsed.notes ?? null
      },
      include: { service: true, staff: true }
    });

    await sendBookingNotifications({
      customerEmail: booking.customerEmail,
      customerName: booking.customerName,
      serviceName: booking.service.name,
      staffName: booking.staff.name,
      startsAt: booking.startsAt.toLocaleString('de-DE'),
      endsAt: booking.endsAt.toLocaleString('de-DE'),
      notes: booking.notes
    });

    res.status(201).json(booking);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', requireAdmin, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const data = updateSchema.parse(req.body);
    const booking = await prisma.booking.update({
      where: { id },
      data,
      include: { service: true, staff: true }
    });
    res.json(booking);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    await prisma.booking.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;

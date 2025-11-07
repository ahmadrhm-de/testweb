import { NextFunction, Request, Response, Router } from 'express';
import { z } from 'zod';
import { prisma } from '../prismaClient';
import { requireAdmin } from './utils';
import { getAvailability } from '../logic/availability';

const openingSchema = z.object({
  weekday: z.number().int().min(0).max(6),
  open: z.string().regex(/^\d{2}:\d{2}$/),
  close: z.string().regex(/^\d{2}:\d{2}$/)
});

const router = Router();

router.get('/', async (_req, res) => {
  const hours = await prisma.openingHours.findMany({
    orderBy: { weekday: 'asc' }
  });
  res.json(hours);
});

router.post('/', requireAdmin, async (req, res, next) => {
  try {
    const data = openingSchema.parse(req.body);
    const record = await prisma.openingHours.upsert({
      where: { weekday: data.weekday },
      update: { open: data.open, close: data.close },
      create: data
    });
    res.status(201).json(record);
  } catch (error) {
    next(error);
  }
});

router.delete('/:weekday', requireAdmin, async (req, res, next) => {
  try {
    const weekday = Number(req.params.weekday);
    await prisma.openingHours.delete({ where: { weekday } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export const availabilityHandler = async (req: Request, res: Response, next: NextFunction) => {
  const schema = z.object({
    serviceId: z.number().int(),
    staffId: z.number().int().optional(),
    date: z.string().refine((val) => !Number.isNaN(Date.parse(val)), 'Ungültiges Datum')
  });

  try {
    const parsed = schema.parse(req.body);
    const date = new Date(parsed.date + 'T00:00:00');
    const availability = await getAvailability({
      serviceId: parsed.serviceId,
      staffId: parsed.staffId,
      date
    });
    res.json(availability);
  } catch (error) {
    next(error);
  }
};

export default router;

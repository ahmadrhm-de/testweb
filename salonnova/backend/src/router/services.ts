import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../prismaClient';
import { requireAdmin, isAdminRequest } from './utils';

const serviceSchema = z.object({
  name: z.string().min(2),
  durationMin: z.number().int().min(15),
  priceCents: z.number().int().nonnegative(),
  active: z.boolean().optional().default(true)
});

const updateSchema = serviceSchema.partial();

const router = Router();

router.get('/', async (req, res) => {
  const includeInactive = isAdminRequest(req);
  const services = await prisma.service.findMany({
    where: includeInactive ? {} : { active: true },
    orderBy: { id: 'asc' }
  });
  res.json(services);
});

router.post('/', requireAdmin, async (req, res, next) => {
  try {
    const data = serviceSchema.parse(req.body);
    const service = await prisma.service.create({
      data: {
        name: data.name,
        durationMin: data.durationMin,
        priceCents: data.priceCents,
        active: data.active
      }
    });
    res.status(201).json(service);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', requireAdmin, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const data = updateSchema.parse(req.body);
    const service = await prisma.service.update({
      where: { id },
      data
    });
    res.json(service);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    await prisma.service.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;

import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../prismaClient';
import { requireAdmin } from './utils';

const staffSchema = z.object({
  name: z.string().min(2),
  bio: z.string().min(10),
  serviceIds: z.array(z.number().int()).default([])
});

const router = Router();

router.get('/', async (_req, res) => {
  const staff = await prisma.staff.findMany({
    include: { services: true },
    orderBy: { id: 'asc' }
  });
  res.json(staff);
});

router.post('/', requireAdmin, async (req, res, next) => {
  try {
    const data = staffSchema.parse(req.body);
    const staff = await prisma.staff.create({
      data: {
        name: data.name,
        bio: data.bio,
        services: {
          connect: data.serviceIds.map((id) => ({ id }))
        }
      },
      include: { services: true }
    });
    res.status(201).json(staff);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', requireAdmin, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const data = staffSchema.partial().parse(req.body);
    const staff = await prisma.staff.update({
      where: { id },
      data: {
        name: data.name,
        bio: data.bio,
        services: data.serviceIds
          ? {
              set: data.serviceIds.map((serviceId) => ({ id: serviceId }))
            }
          : undefined
      },
      include: { services: true }
    });
    res.json(staff);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    await prisma.staff.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;

import { endOfDay, formatISO, startOfDay } from 'date-fns';
import { prisma } from '../prismaClient';
import { generateSlots } from './slots';

export interface AvailabilityRequest {
  serviceId: number;
  staffId?: number;
  date: Date;
}

export interface AvailabilityResponse {
  staffId: number;
  slots: { start: string; end: string }[];
}

const BUFFER_MINUTES = 10;

export const getAvailability = async (
  input: AvailabilityRequest
): Promise<AvailabilityResponse[]> => {
  const service = await prisma.service.findFirst({
    where: { id: input.serviceId, active: true },
    include: { staff: true }
  });

  if (!service) {
    throw new Error('Service not found or inactive');
  }

  const requestedStaffIds = input.staffId
    ? [input.staffId]
    : service.staff.map((s) => s.id);

  if (!requestedStaffIds.length) {
    return [];
  }

  if (input.staffId && !requestedStaffIds.includes(input.staffId)) {
    throw new Error('Selected staff member cannot perform this service');
  }

  const weekday = input.date.getDay();
  const opening = await prisma.openingHours.findFirst({
    where: { weekday }
  });

  const dayStart = startOfDay(input.date);
  const dayEnd = endOfDay(input.date);

  const bookings = await prisma.booking.findMany({
    where: {
      staffId: { in: requestedStaffIds },
      startsAt: { gte: dayStart, lte: dayEnd }
    }
  });

  return requestedStaffIds.map((staffId) => {
    const staffBookings = bookings.filter((b) => b.staffId === staffId);

    const slots = generateSlots({
      date: input.date,
      serviceDurationMin: service.durationMin,
      opening: opening ? { open: opening.open, close: opening.close } : null,
      existing: staffBookings.map((b) => ({
        startsAt: b.startsAt,
        endsAt: b.endsAt
      })),
      bufferMinutes: BUFFER_MINUTES
    }).map((slot) => ({
      start: formatISO(slot.start),
      end: formatISO(slot.end)
    }));

    return { staffId, slots };
  });
};

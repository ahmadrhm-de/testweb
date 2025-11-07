import { addMinutes, isBefore, setHours, setMinutes } from 'date-fns';

type OpeningWindow = {
  open: string;
  close: string;
};

type ExistingBooking = {
  startsAt: Date;
  endsAt: Date;
};

export interface SlotInput {
  date: Date;
  serviceDurationMin: number;
  opening: OpeningWindow | null;
  existing: ExistingBooking[];
  bufferMinutes?: number;
  intervalMinutes?: number;
}

export interface SlotResult {
  start: Date;
  end: Date;
}

const DEFAULT_BUFFER = 10;
const DEFAULT_INTERVAL = 5;

export const parseTimeToDate = (date: Date, time: string): Date => {
  const [h, m] = time.split(':').map(Number);
  const withHours = setHours(date, h);
  return setMinutes(withHours, m);
};

export const isWithinOpeningHours = (date: Date, opening: OpeningWindow | null): boolean => {
  if (!opening) return false;
  const start = parseTimeToDate(date, opening.open);
  const end = parseTimeToDate(date, opening.close);
  return !isBefore(date, start) && isBefore(date, end);
};

const overlaps = (candidate: SlotResult, booking: ExistingBooking, buffer: number): boolean => {
  const startWithBuffer = addMinutes(booking.startsAt, -buffer);
  const endWithBuffer = addMinutes(booking.endsAt, buffer);
  return candidate.start < endWithBuffer && candidate.end > startWithBuffer;
};

export const generateSlots = ({
  date,
  serviceDurationMin,
  opening,
  existing,
  bufferMinutes = DEFAULT_BUFFER,
  intervalMinutes = DEFAULT_INTERVAL
}: SlotInput): SlotResult[] => {
  if (!opening) return [];

  const windowStart = parseTimeToDate(date, opening.open);
  const windowEnd = parseTimeToDate(date, opening.close);
  const required = serviceDurationMin;

  const slots: SlotResult[] = [];
  let cursor = new Date(windowStart);

  while (addMinutes(cursor, required) <= windowEnd) {
    const candidate: SlotResult = {
      start: new Date(cursor),
      end: addMinutes(cursor, required)
    };

    const conflict = existing.some((booking) => overlaps(candidate, booking, bufferMinutes));

    if (!conflict) {
      slots.push(candidate);
    }

    cursor = addMinutes(cursor, intervalMinutes);
  }

  return slots;
};

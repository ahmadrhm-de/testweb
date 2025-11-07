import { addMinutes, setHours, setMinutes } from 'date-fns';
import { generateSlots, isWithinOpeningHours, parseTimeToDate } from '../logic/slots';

describe('Slot-Engine', () => {
  const baseDate = new Date('2024-06-03T00:00:00Z');

  it('berechnet verfügbare Slots basierend auf Öffnungszeiten', () => {
    const slots = generateSlots({
      date: baseDate,
      serviceDurationMin: 30,
      opening: { open: '09:00', close: '10:00' },
      existing: []
    });
    expect(slots).toHaveLength(7);
    expect(slots[0].start.toISOString()).toBe(parseTimeToDate(baseDate, '09:00').toISOString());
  });

  it('berücksichtigt eine Pufferzeit zwischen Terminen', () => {
    const existingStart = parseTimeToDate(baseDate, '09:00');
    const slots = generateSlots({
      date: baseDate,
      serviceDurationMin: 30,
      opening: { open: '09:00', close: '11:00' },
      existing: [
        {
          startsAt: existingStart,
          endsAt: addMinutes(existingStart, 30)
        }
      ],
      bufferMinutes: 15,
      intervalMinutes: 15
    });

    const blockedSlot = slots.find((slot) => slot.start.getUTCHours() === 9 && slot.start.getUTCMinutes() === 15);
    expect(blockedSlot).toBeUndefined();
  });

  it('verhindert Doppelbuchungen zur selben Zeit', () => {
    const existingStart = parseTimeToDate(baseDate, '09:30');
    const slots = generateSlots({
      date: baseDate,
      serviceDurationMin: 30,
      opening: { open: '09:00', close: '12:00' },
      existing: [
        {
          startsAt: existingStart,
          endsAt: addMinutes(existingStart, 30)
        }
      ]
    });

    expect(slots.some((slot) => slot.start.getTime() === existingStart.getTime())).toBe(false);
  });

  it('validiert Zeitpunkte innerhalb der Öffnungszeiten', () => {
    const openTime = parseTimeToDate(baseDate, '09:00');
    const closedTime = setMinutes(setHours(baseDate, 12), 0);
    expect(isWithinOpeningHours(openTime, { open: '09:00', close: '12:00' })).toBe(true);
    expect(isWithinOpeningHours(closedTime, { open: '09:00', close: '12:00' })).toBe(false);
  });
});

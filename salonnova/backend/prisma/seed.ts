import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const services = await prisma.service.createMany({
    data: [
      { name: 'Haarschnitt Damen', durationMin: 60, priceCents: 6900 },
      { name: 'Haarschnitt Herren', durationMin: 45, priceCents: 4900 },
      { name: 'Coloration', durationMin: 90, priceCents: 9900 },
      { name: 'Styling & Finish', durationMin: 30, priceCents: 3500 }
    ],
    skipDuplicates: true
  });

  const serviceRecords = await prisma.service.findMany();

  await prisma.staff.createMany({
    data: [
      { name: 'Lina Sommer', bio: 'Expertin für moderne Colorationen und Trends.' },
      { name: 'Mara Winter', bio: 'Spezialistin für Kurzhaarschnitte & Barbering.' },
      { name: 'Elias Frühling', bio: 'Stylist mit Fokus auf nachhaltige Pflege.' }
    ],
    skipDuplicates: true
  });

  const staff = await prisma.staff.findMany();

  for (const member of staff) {
    await prisma.staff.update({
      where: { id: member.id },
      data: {
        services: {
          set: serviceRecords.map((service) => ({ id: service.id }))
        }
      }
    });
  }

  const weekdays = [0, 1, 2, 3, 4, 5, 6];
  for (const day of weekdays) {
    if (day === 6) continue; // Sonntag geschlossen
    await prisma.openingHours.upsert({
      where: { weekday: day },
      create: { weekday: day, open: '09:00', close: '18:00' },
      update: { open: '09:00', close: '18:00' }
    });
  }
  await prisma.openingHours.deleteMany({ where: { weekday: 6 } });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

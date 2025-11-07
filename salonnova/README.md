# SalonNova

SalonNova ist eine moderne, vollständig lokalisierte Friseur-Erlebnisplattform mit Terminbuchung, Admin-Dashboard und responsiver React-Oberfläche. Das Projekt besteht aus einem Node.js/Express-Backend mit Prisma ORM (SQLite) sowie einem React + Vite Frontend mit Tailwind CSS und Framer Motion.

## Features

- 💇‍♀️ **Startseite** mit Hero, Leistungsübersicht, Team, Galerie, Öffnungszeiten und Standortabschnitt
- 📅 **Mehrstufiger Buchungsablauf** (Service → Stylist:in → Datum → Uhrzeit → Kundendaten)
- 🧠 **Slot-Engine** mit Öffnungszeiten, Service-Dauer, Pufferzeiten & Überschneidungsprüfung
- 📧 **E-Mail-Benachrichtigungen** via Nodemailer & Ethereal Test-Account
- 🔐 **Admin-Dashboard** mit Passwortschutz über `x-admin-key`, CRUD für Services, Team, Öffnungszeiten und Terminübersicht in Tages-/Wochenansicht
- 🌙 **Dark/Light-Mode**, sanfte Animationen, voll responsives Design und vorbereitete Lokalisierungsstruktur (DE/EN)

## Projektstruktur

```
salonnova/
  backend/
    src/
      index.ts
      env.ts
      prisma/
        schema.prisma
      logic/
        slots.ts
        availability.ts
        mailer.ts
      router/
        bookings.ts
        services.ts
        staff.ts
        settings.ts
      prismaClient.ts
      __tests__/
        slots.test.ts
    prisma/
      seed.ts
    package.json
    tsconfig.json
    jest.config.js
  frontend/
    src/
      App.tsx
      main.tsx
      index.css
      lib/
        api.ts
        i18n.ts
      components/
        NavBar.tsx
        Footer.tsx
        ServiceCard.tsx
        Stepper.tsx
        Calendar.tsx
        TimeGrid.tsx
        Toast.tsx
      pages/
        Home.tsx
        Booking.tsx
        Confirm.tsx
        Admin.tsx
    public/images/
      … (Platzhalterbilder)
    package.json
    vite.config.ts
    tailwind.config.js
    postcss.config.js
    tsconfig.json
    tsconfig.node.json
  .env.example
  README.md
```

## Entwicklung starten

### Backend

```bash
cd backend
npm install
npx prisma migrate dev
npm run dev
```

- Tests ausführen: `npm test`
- Seed-Daten: `npx prisma db seed`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Standardmäßig erwartet das Frontend das Backend unter `http://localhost:4000`. Dies kann über `VITE_API_URL` angepasst werden.

Viel Spaß mit SalonNova! 💫

import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { env } from './env';
import servicesRouter from './router/services';
import staffRouter from './router/staff';
import bookingsRouter from './router/bookings';
import openingHoursRouter, { availabilityHandler } from './router/settings';
import { prisma } from './prismaClient';

const app = express();

app.use(cors());
app.use(express.json());

const bookingsLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MIN * 60 * 1000,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false
});

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.use('/api/services', servicesRouter);
app.use('/api/staff', staffRouter);
app.use('/api/opening-hours', openingHoursRouter);
app.post('/api/availability', availabilityHandler);
app.use('/api/bookings', bookingsLimiter, bookingsRouter);

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (err.name === 'ZodError') {
    return res.status(400).json({ error: err.errors });
  }
  // eslint-disable-next-line no-console
  console.error(err);
  res.status(500).json({ error: 'Interner Serverfehler' });
});

const start = async () => {
  await prisma.$connect();
  app.listen(env.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`SalonNova Backend läuft auf Port ${env.PORT}`);
  });
};

start().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('Server konnte nicht gestartet werden', error);
  process.exit(1);
});

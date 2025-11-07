import nodemailer from 'nodemailer';
import { env } from '../env';

let transporterPromise: Promise<nodemailer.Transporter> | null = null;

const getTransporter = async () => {
  if (!transporterPromise) {
    transporterPromise = nodemailer.createTestAccount().then((account) => {
      return nodemailer.createTransport({
        host: account.smtp.host,
        port: account.smtp.port,
        secure: account.smtp.secure,
        auth: {
          user: account.user,
          pass: account.pass
        }
      });
    });
  }
  return transporterPromise;
};

export interface BookingMailPayload {
  to: string;
  subject: string;
  text: string;
}

export const sendMail = async (payload: BookingMailPayload) => {
  const transporter = await getTransporter();
  const info = await transporter.sendMail({
    from: env.EMAIL_FROM,
    to: payload.to,
    subject: payload.subject,
    text: payload.text
  });

  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
  }
};

export const sendBookingNotifications = async (options: {
  customerEmail: string;
  customerName: string;
  serviceName: string;
  staffName: string;
  startsAt: string;
  endsAt: string;
  notes?: string | null;
}) => {
  const baseMessage = `Hallo ${options.customerName},\n\n` +
    `vielen Dank für Ihre Buchung bei SalonNova.\n` +
    `Termin: ${options.startsAt} - ${options.endsAt}\n` +
    `Service: ${options.serviceName}\n` +
    `Stylist: ${options.staffName}\n\n` +
    `${options.notes ? `Hinweise: ${options.notes}\n\n` : ''}` +
    'Wir freuen uns auf Ihren Besuch!';

  await sendMail({
    to: options.customerEmail,
    subject: 'SalonNova – Terminbestätigung',
    text: baseMessage
  });

  await sendMail({
    to: env.EMAIL_FROM,
    subject: `Neue Buchung: ${options.customerName}`,
    text:
      `Neuer Termin:\nKunde: ${options.customerName}\n` +
      `Kontakt: ${options.customerEmail}\n` +
      `Service: ${options.serviceName}\n` +
      `Stylist: ${options.staffName}\n` +
      `Beginn: ${options.startsAt}\n` +
      `Ende: ${options.endsAt}\n` +
      `${options.notes ? `Notizen: ${options.notes}` : ''}`
  });
};

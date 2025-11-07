import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api';

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const getServices = async () => {
  const { data } = await api.get('/services');
  return data;
};

export const getStaff = async () => {
  const { data } = await api.get('/staff');
  return data;
};

export const getOpeningHours = async () => {
  const { data } = await api.get('/opening-hours');
  return data;
};

export const getAvailability = async (payload: { serviceId: number; staffId?: number; date: string }) => {
  const { data } = await api.post('/availability', payload);
  return data as { staffId: number; slots: { start: string; end: string }[] }[];
};

export const createBooking = async (payload: any) => {
  const { data } = await api.post('/bookings', payload);
  return data;
};

export const adminClient = (token: string) =>
  axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
      'x-admin-key': token
    }
  });

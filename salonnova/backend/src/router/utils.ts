import { NextFunction, Request, Response } from 'express';
import { env } from '../env';

export const isAdminRequest = (req: Request): boolean => {
  return req.header('x-admin-key') === env.ADMIN_PASSWORD;
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!isAdminRequest(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

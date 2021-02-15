import 'express';
import { KickboardClient } from 'kickboard-sdk';
import { KickboardDoc } from '../src/models';

declare global {
  namespace Express {
    interface Request {
      kickboard: KickboardDoc;
      kickboardClient: KickboardClient;
    }
  }
}

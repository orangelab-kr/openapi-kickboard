import 'express';
import { KickboardClient } from 'kickboard-sdk';
import { KickboardDoc } from '../src/models';

declare global {
  namespace Express {
    interface Request {
      kickboard: KickboardShort;
      internal: {
        sub: string;
        iss: string;
        aud: string;
        prs: string[];
        kickboard: KickboardDoc;
        kickboardClient: KickboardClient;
        iat: Date;
        exp: Date;
      };
    }
  }
}

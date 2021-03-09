import 'express';
import { KickboardClient } from 'kickboard-sdk';
import { InternalPlatformAccessKey } from 'openapi-internal-sdk';
import { KickboardDoc } from '../src/models';

declare global {
  namespace Express {
    interface Request {
      accessKey: InternalPlatformAccessKey;
      kickboard: KickboardShort;
      internal: {
        sub: string;
        iss: string;
        aud: string;
        prs: boolean[];
        kickboard: KickboardDoc;
        kickboardClient: KickboardClient;
        iat: Date;
        exp: Date;
      };
    }
  }
}

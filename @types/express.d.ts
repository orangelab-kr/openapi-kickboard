import 'express';
import { KickboardClient } from '@hikick/kickboard-sdk';
import {
  InternalPlatformAccessKey,
  InternalPlatformUser,
} from 'openapi-internal-sdk';
import { KickboardDoc } from '..';

declare global {
  namespace Express {
    interface Request {
      permissionIds: string[];
      loggined: {
        platform: InternalPlatform;
        accessKey?: InternalPlatformAccessKey;
        user?: InternalPlatformUser;
      };
      kickboard: KickboardShort;
      kickboardClient: KickboardClient;
      internal: {
        sub: string;
        iss: string;
        aud: string;
        prs: boolean[];
        kickboard: KickboardDoc;
        kickboardClient: KickboardClient;
        helmet: HelmetDoc;
        iat: Date;
        exp: Date;
      };
    }
  }
}

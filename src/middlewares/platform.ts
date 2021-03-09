import { Callback, Wrapper, logger } from '../tools';
import {
  InternalError,
  InternalPlatformClient,
  OPCODE,
  PlatformPermission,
} from 'openapi-internal-sdk';

import os from 'os';

export default function PlatformMiddleware(
  permissionIds: string[] = []
): Callback {
  const hostname = os.hostname();
  const platformClient = new InternalPlatformClient({
    issuer: 'openapi.hikick.kr',
    secretKey: process.env.HIKICK_OPENAPI_PLATFORM_KEY || '',
    email: `${hostname}-${process.env.NODE_ENV}@${process.env.AWS_LAMBDA_FUNCTION_NAME}.openapi.hikick.kr`,
    permissions: [PlatformPermission.ACCESS_KEYS_AUTHORIZE],
  });

  platformClient.baseURL = process.env.HIKICK_OPENAPI_PLATFORM_URL || '';
  return Wrapper(async (req, res, next) => {
    try {
      const { headers } = req;
      const platformAccessKeyId = `${headers['x-hikick-platform-access-key-id']}`;
      const platformSecretAccessKey = `${headers['x-hikick-platform-secret-access-key']}`;
      const accessKey = await platformClient.getPlatformFromAccessKey({
        platformAccessKeyId,
        platformSecretAccessKey,
        permissionIds,
      });

      req.accessKey = accessKey;
      next();
    } catch (err) {
      if (process.env.NODE_ENV === 'dev') {
        logger.error(err.message);
        logger.error(err.stack);
      }

      throw new InternalError(
        '인증이 필요한 서비스입니다.',
        OPCODE.REQUIRED_INTERAL_LOGIN
      );
    }
  });
}

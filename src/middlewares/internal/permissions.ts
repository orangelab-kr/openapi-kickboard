import Wrapper, { Callback } from '../../tools/wrapper';

import InternalError from '../../tools/error';
import { OPCODE } from '../../tools';

export enum PERMISSION {
  ACTION_SET = 'kickboard.action.set',

  METHOD_LATEST = 'kickboard.method.latest',
  METHOD_REFRESH = 'kickboard.method.refresh',
  METHOD_REALTIME = 'kickboard.method.realtime',

  LOOKUP = 'kickboard.lookup',
  LOOKUP_STATUS = 'kickboard.lookup.status',
  LOOKUP_INFO = 'kickboard.lookup.info',
  LOOKUP_CONFIG = 'kickboard.lookup.config',
  LOOKUP_BATTERY = 'kickboard.lookup.battery',
}

export default function InternalPermissionMiddleware(
  permission: PERMISSION
): Callback {
  return Wrapper(async (req, res, next) => {
    if (!req.internal.prs.includes(permission)) {
      throw new InternalError(
        `${permission} 권한이 없습니다.`,
        OPCODE.ACCESS_DENIED
      );
    }

    await next();
  });
}

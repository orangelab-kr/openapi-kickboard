import Wrapper, { Callback } from '../../tools/wrapper';

import InternalError from '../../tools/error';
import { OPCODE } from '../../tools';

export enum PERMISSION {
  ACTION_SET = 'kickboard.action.set',

  ACTION_START = 'kickboard.action.start',
  ACTION_STOP = 'kickboard.action.stop',

  ACTION_LOCK = 'kickboard.action.lock',
  ACTION_UNLOCK = 'kickboard.action.unlock',

  ACTION_BATTERY_LOCK = 'kickboard.action.battery.lock',
  ACTION_BATTERY_UNLOCK = 'kickboard.action.battery.unlock',

  ACTION_BUZZER_ON = 'kickboard.action.buzzer.on',
  ACTION_BUZZER_OFF = 'kickboard.action.buzzer.off',

  ACTION_BLUETOOTH_ON = 'kickboard.action.bluetooth.on',
  ACTION_BLUETOOTH_OFF = 'kickboard.action.bluetooth.off',

  ACTION_LIGHT_ON = 'kickboard.action.light.on',
  ACTION_LIGHT_OFF = 'kickboard.action.light.off',

  ACTION_ALARM_ON = 'kickboard.action.alarm.on',
  ACTION_ALARM_OFF = 'kickboard.action.alarm.off',

  ACTION_REBOOT = 'kickboard.action.reboot',

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

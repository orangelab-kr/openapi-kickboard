import {
  Alarm,
  InternalPermissionMiddleware,
  OPCODE,
  PERMISSION,
  Wrapper,
} from '../..';

import { Router } from 'express';

export function getInternalAlarmRouter(): Router {
  const router = Router();

  router.get(
    '/on',
    InternalPermissionMiddleware(PERMISSION.ACTION_ALARM_ON),
    Wrapper(async (req, res) => {
      const { kickboardClient } = req.internal;
      await Alarm.alarmOn(kickboardClient, req.query);
      res.json({ opcode: OPCODE.SUCCESS });
    })
  );

  router.get(
    '/off',
    InternalPermissionMiddleware(PERMISSION.ACTION_ALARM_OFF),
    Wrapper(async (req, res) => {
      const { kickboardClient } = req.internal;
      await Alarm.alarmOff(kickboardClient);
      res.json({ opcode: OPCODE.SUCCESS });
    })
  );

  return router;
}

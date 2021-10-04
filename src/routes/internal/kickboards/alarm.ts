import { Router } from 'express';
import {
  Alarm,
  InternalPermissionMiddleware,
  PERMISSION,
  RESULT,
  Wrapper,
} from '../../..';

export function getInternalKickboardsAlarmRouter(): Router {
  const router = Router();

  router.get(
    '/on',
    InternalPermissionMiddleware(PERMISSION.KICKBOARD_ACTION_ALARM_ON),
    Wrapper(async (req, res) => {
      const { kickboardClient } = req.internal;
      await Alarm.alarmOn(kickboardClient, req.query);
      throw RESULT.SUCCESS();
    })
  );

  router.get(
    '/off',
    InternalPermissionMiddleware(PERMISSION.KICKBOARD_ACTION_ALARM_OFF),
    Wrapper(async (req, res) => {
      const { kickboardClient } = req.internal;
      await Alarm.alarmOff(kickboardClient);
      throw RESULT.SUCCESS();
    })
  );

  return router;
}

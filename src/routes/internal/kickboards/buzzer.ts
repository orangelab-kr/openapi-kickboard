import { Router } from 'express';
import {
  Buzzer,
  InternalPermissionMiddleware,
  PERMISSION,
  RESULT,
  Wrapper,
} from '../../..';

export function getInternalKickboardsBuzzerRouter(): Router {
  const router = Router();

  router.get(
    '/on',
    InternalPermissionMiddleware(PERMISSION.KICKBOARD_ACTION_BUZZER_ON),
    Wrapper(async (req) => {
      const { kickboardClient } = req.internal;
      await Buzzer.buzzerOn(kickboardClient, req.query);
      throw RESULT.SUCCESS();
    })
  );

  router.get(
    '/off',
    InternalPermissionMiddleware(PERMISSION.KICKBOARD_ACTION_BATTERY_UNLOCK),
    Wrapper(async (req) => {
      const { kickboardClient } = req.internal;
      await Buzzer.buzzerOff(kickboardClient);
      throw RESULT.SUCCESS();
    })
  );

  return router;
}

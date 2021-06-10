import {
  Buzzer,
  InternalPermissionMiddleware,
  OPCODE,
  PERMISSION,
  Wrapper,
} from '../../..';

import { Router } from 'express';

export function getInternalKickboardsBuzzerRouter(): Router {
  const router = Router();

  router.get(
    '/on',
    InternalPermissionMiddleware(PERMISSION.KICKBOARD_ACTION_BUZZER_ON),
    Wrapper(async (req, res) => {
      const { kickboardClient } = req.internal;
      await Buzzer.buzzerOn(kickboardClient, req.query);
      res.json({ opcode: OPCODE.SUCCESS });
    })
  );

  router.get(
    '/off',
    InternalPermissionMiddleware(PERMISSION.KICKBOARD_ACTION_BATTERY_UNLOCK),
    Wrapper(async (req, res) => {
      const { kickboardClient } = req.internal;
      await Buzzer.buzzerOff(kickboardClient);
      res.json({ opcode: OPCODE.SUCCESS });
    })
  );

  return router;
}

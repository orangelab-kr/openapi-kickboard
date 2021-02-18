import InternalPermissionMiddleware, {
  PERMISSION,
} from '../../middlewares/internal/permissions';
import { OPCODE, Wrapper } from '../../tools';

import { Alarm } from '../../controllers';
import { Router } from 'express';

export default function getInternalAlarmRouter(): Router {
  const router = Router();

  router.get(
    '/on',
    InternalPermissionMiddleware(PERMISSION.ACTION_ALARM_ON),
    Wrapper(async (req, res) => {
      await Alarm.alarmOn(req.kickboardClient, req.query);
      res.json({ opcode: OPCODE.SUCCESS });
    })
  );

  router.get(
    '/off',
    InternalPermissionMiddleware(PERMISSION.ACTION_ALARM_OFF),
    Wrapper(async (req, res) => {
      await Alarm.alarmOff(req.kickboardClient);
      res.json({ opcode: OPCODE.SUCCESS });
    })
  );

  return router;
}

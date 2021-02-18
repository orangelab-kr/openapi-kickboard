import InternalPermissionMiddleware, {
  PERMISSION,
} from '../../middlewares/internal/permissions';
import { OPCODE, Wrapper } from '../../tools';

import { Buzzer } from '../../controllers';
import { Router } from 'express';

export default function getInternalBuzzerRouter(): Router {
  const router = Router();

  router.get(
    '/on',
    InternalPermissionMiddleware(PERMISSION.ACTION_BUZZER_ON),
    Wrapper(async (req, res) => {
      await Buzzer.buzzerOn(req.kickboardClient, req.query);
      res.json({ opcode: OPCODE.SUCCESS });
    })
  );

  router.get(
    '/off',
    InternalPermissionMiddleware(PERMISSION.ACTION_BATTERY_UNLOCK),
    Wrapper(async (req, res) => {
      await Buzzer.buzzerOff(req.kickboardClient);
      res.json({ opcode: OPCODE.SUCCESS });
    })
  );

  return router;
}

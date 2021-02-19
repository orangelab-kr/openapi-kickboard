import { Router } from 'express';
import { Buzzer } from '../../controllers';
import InternalPermissionMiddleware, {
  PERMISSION,
} from '../../middlewares/internal/permissions';
import { OPCODE, Wrapper } from '../../tools';

export default function getInternalBuzzerRouter(): Router {
  const router = Router();

  router.get(
    '/on',
    InternalPermissionMiddleware(PERMISSION.ACTION_BUZZER_ON),
    Wrapper(async (req, res) => {
      const { kickboardClient } = req.internal;
      await Buzzer.buzzerOn(kickboardClient, req.query);
      res.json({ opcode: OPCODE.SUCCESS });
    })
  );

  router.get(
    '/off',
    InternalPermissionMiddleware(PERMISSION.ACTION_BATTERY_UNLOCK),
    Wrapper(async (req, res) => {
      const { kickboardClient } = req.internal;
      await Buzzer.buzzerOff(kickboardClient);
      res.json({ opcode: OPCODE.SUCCESS });
    })
  );

  return router;
}

import InternalPermissionMiddleware, {
  PERMISSION,
} from '../../middlewares/internal/permissions';
import { OPCODE, Wrapper } from '../../tools';

import Light from '../../controllers/light';
import { Router } from 'express';

export default function getInternalLightRouter(): Router {
  const router = Router();

  router.get(
    '/on',
    InternalPermissionMiddleware(PERMISSION.ACTION_LIGHT_ON),
    Wrapper(async (req, res) => {
      await Light.lightOn(req.kickboardClient, req.query);
      res.json({ opcode: OPCODE.SUCCESS });
    })
  );

  router.get(
    '/off',
    InternalPermissionMiddleware(PERMISSION.ACTION_LIGHT_OFF),
    Wrapper(async (req, res) => {
      await Light.lightOff(req.kickboardClient);
      res.json({ opcode: OPCODE.SUCCESS });
    })
  );

  return router;
}

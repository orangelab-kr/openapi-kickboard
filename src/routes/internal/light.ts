import {
  InternalPermissionMiddleware,
  Light,
  OPCODE,
  PERMISSION,
  Wrapper,
} from '../..';

import { Router } from 'express';

export function getInternalLightRouter(): Router {
  const router = Router();

  router.get(
    '/on',
    InternalPermissionMiddleware(PERMISSION.ACTION_LIGHT_ON),
    Wrapper(async (req, res) => {
      const { kickboardClient } = req.internal;
      await Light.lightOn(kickboardClient, req.query);
      res.json({ opcode: OPCODE.SUCCESS });
    })
  );

  router.get(
    '/off',
    InternalPermissionMiddleware(PERMISSION.ACTION_LIGHT_OFF),
    Wrapper(async (req, res) => {
      const { kickboardClient } = req.internal;
      await Light.lightOff(kickboardClient);
      res.json({ opcode: OPCODE.SUCCESS });
    })
  );

  return router;
}

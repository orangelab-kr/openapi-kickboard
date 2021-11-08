import {
  InternalPermissionMiddleware,
  Light,
  PERMISSION,
  RESULT,
  Wrapper,
} from '../../..';

import { Router } from 'express';

export function getInternalKickboardsLightRouter(): Router {
  const router = Router();

  router.get(
    '/on',
    InternalPermissionMiddleware(PERMISSION.KICKBOARD_ACTION_LIGHT_ON),
    Wrapper(async (req) => {
      const { kickboardClient } = req.internal;
      await Light.lightOn(kickboardClient, req.query);
      throw RESULT.SUCCESS();
    })
  );

  router.get(
    '/off',
    InternalPermissionMiddleware(PERMISSION.KICKBOARD_ACTION_LIGHT_OFF),
    Wrapper(async (req) => {
      const { kickboardClient } = req.internal;
      await Light.lightOff(kickboardClient);
      throw RESULT.SUCCESS();
    })
  );

  return router;
}

import { Router } from 'express';
import { PacketConfig } from 'kickboard-sdk';
import {
  Config,
  InternalPermissionMiddleware,
  PERMISSION,
  RESULT,
  Wrapper,
} from '../../..';

export function getInternalKickboardsConfigRouter(): Router {
  const router = Router();

  router.get(
    '/',
    InternalPermissionMiddleware(PERMISSION.KICKBOARD_METHOD_LATEST),
    Wrapper(async (req) => {
      const { kickboardClient } = req.internal;
      const config = await Config.getConfig(kickboardClient);
      throw RESULT.SUCCESS({ details: { config } });
    })
  );

  router.post(
    '/',
    InternalPermissionMiddleware(PERMISSION.KICKBOARD_METHOD_REFRESH),
    Wrapper(async (req) => {
      const { kickboardClient } = req.internal;
      const config = await Config.refreshConfig(kickboardClient);
      throw RESULT.SUCCESS({ details: { config } });
    })
  );

  router
    .use(InternalPermissionMiddleware(PERMISSION.KICKBOARD_METHOD_REALTIME))
    .ws('/', async (ws, req) => {
      const { kickboardClient } = req.internal;
      const subscribe = await kickboardClient.createSubscribe();
      subscribe.on('config', (packet: PacketConfig) => {
        ws.send(JSON.stringify(packet));
      });

      ws.on('close', () => {
        kickboardClient.stopSubscribe(subscribe);
      });

      await kickboardClient.startSubscribe(subscribe);
    });

  return router;
}

import { Router } from 'express';
import { PacketInfo } from '@hikick/kickboard-sdk';
import {
  Info,
  InternalPermissionMiddleware,
  PERMISSION,
  RESULT,
  Wrapper,
} from '../../..';

export function getInternalKickboardsInfoRouter(): Router {
  const router = Router();

  router.get(
    '/',
    InternalPermissionMiddleware(PERMISSION.KICKBOARD_METHOD_LATEST),
    Wrapper(async (req) => {
      const { kickboardClient } = req.internal;
      const info = await Info.getInfo(kickboardClient);
      throw RESULT.SUCCESS({ details: { info } });
    })
  );

  router.post(
    '/',
    InternalPermissionMiddleware(PERMISSION.KICKBOARD_METHOD_REFRESH),
    Wrapper(async (req) => {
      const { kickboardClient } = req.internal;
      const info = await Info.refreshInfo(kickboardClient);
      throw RESULT.SUCCESS({ details: { info } });
    })
  );

  router
    .use(InternalPermissionMiddleware(PERMISSION.KICKBOARD_METHOD_REALTIME))
    .ws('/', async (ws, req) => {
      const { kickboardClient } = req.internal;
      const subscribe = await kickboardClient.createSubscribe();
      subscribe.on('info', (packet: PacketInfo) => {
        ws.send(JSON.stringify(packet));
      });

      ws.on('close', () => {
        kickboardClient.stopSubscribe(subscribe);
      });

      await kickboardClient.startSubscribe(subscribe);
    });

  return router;
}

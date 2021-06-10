import {
  InternalPermissionMiddleware,
  OPCODE,
  PERMISSION,
  Status,
  Wrapper,
} from '../../..';

import { PacketStatus } from 'kickboard-sdk';
import { Router } from 'express';

export function getInternalKickboardsStatusRouter(): Router {
  const router = Router();

  router.get(
    '/',
    InternalPermissionMiddleware(PERMISSION.KICKBOARD_METHOD_LATEST),
    Wrapper(async (req, res) => {
      const { kickboardClient } = req.internal;
      const status = await Status.getStatus(kickboardClient);
      res.json({ opcode: OPCODE.SUCCESS, status });
    })
  );

  router.get(
    '/timeline',
    InternalPermissionMiddleware(PERMISSION.KICKBOARD_METHOD_TIMELINE),
    Wrapper(async (req, res) => {
      const { kickboardClient } = req.internal;
      const status = await Status.getStatusBySpecificTime(
        kickboardClient,
        req.query
      );

      res.json({ opcode: OPCODE.SUCCESS, status });
    })
  );

  router.post(
    '/',
    InternalPermissionMiddleware(PERMISSION.KICKBOARD_METHOD_REFRESH),
    Wrapper(async (req, res) => {
      const { kickboardClient } = req.internal;
      const status = await Status.refreshStatus(kickboardClient);
      res.json({ opcode: OPCODE.SUCCESS, status });
    })
  );

  router
    .use(InternalPermissionMiddleware(PERMISSION.KICKBOARD_METHOD_REALTIME))
    .ws('/', async (ws, req) => {
      const { kickboardClient } = req.internal;
      const subscribe = await kickboardClient.createSubscribe();
      subscribe.on('status', (packet: PacketStatus) => {
        ws.send(JSON.stringify(packet));
      });

      ws.on('close', () => {
        kickboardClient.stopSubscribe(subscribe);
      });

      await kickboardClient.startSubscribe(subscribe);
    });

  return router;
}

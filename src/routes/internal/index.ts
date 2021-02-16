import InternalPermissionMiddleware, {
  PERMISSION,
} from '../../middlewares/internal/permissions';
import { OPCODE, Wrapper } from '../../tools';

import InternalKickboardMiddleware from '../../middlewares/internal/kickboard';
import Kickboard from '../../controllers/kickboard';
import { Packet } from 'kickboard-sdk';
import { Router } from 'express';
import getInternalBatteryRouter from './battery';
import getInternalConfigRouter from './config';
import getInternalInfoRouter from './info';
import getInternalStatusRouter from './status';

export default function getInternalRouter(): Router {
  const router = Router();

  router.get(
    '/:kickboardId',
    InternalPermissionMiddleware(PERMISSION.LOOKUP),
    InternalPermissionMiddleware(PERMISSION.METHOD_LATEST),
    InternalKickboardMiddleware(),
    Wrapper(async (req, res) => {
      const { kickboard } = req;
      res.json({ opcode: OPCODE.SUCCESS, kickboard });
    })
  );

  router.post(
    '/:kickboardId',
    InternalPermissionMiddleware(PERMISSION.ACTION_SET),
    Wrapper(async (req, res) => {
      const kickboard = await Kickboard.setKickboard(
        req.params.kickboardId,
        req.body
      );

      res.json({ opcode: OPCODE.SUCCESS, kickboard });
    })
  );

  router.use(
    '/:kickboardId/status',
    InternalPermissionMiddleware(PERMISSION.LOOKUP_STATUS),
    InternalKickboardMiddleware(),
    getInternalStatusRouter()
  );

  router.use(
    '/:kickboardId/info',
    InternalPermissionMiddleware(PERMISSION.LOOKUP_INFO),
    InternalKickboardMiddleware(),
    getInternalInfoRouter()
  );
  router.use(
    '/:kickboardId/config',
    InternalPermissionMiddleware(PERMISSION.LOOKUP_CONFIG),
    InternalKickboardMiddleware(),
    getInternalConfigRouter()
  );

  router.use(
    '/:kickboardId/battery',
    InternalPermissionMiddleware(PERMISSION.LOOKUP_BATTERY),
    InternalKickboardMiddleware(),
    getInternalBatteryRouter()
  );

  router
    .use(InternalPermissionMiddleware(PERMISSION.LOOKUP))
    .use(InternalPermissionMiddleware(PERMISSION.METHOD_REALTIME))
    .use(InternalKickboardMiddleware())
    .ws('/:kickboardId', async (ws, req) => {
      const { kickboardClient } = req;
      const subscribe = await kickboardClient.createSubscribe();
      subscribe.on('all', (packet: Packet) => {
        ws.send(JSON.stringify(packet));
      });

      ws.on('close', () => {
        kickboardClient.stopSubscribe(subscribe);
      });

      await kickboardClient.startSubscribe(subscribe);
    });

  return router;
}

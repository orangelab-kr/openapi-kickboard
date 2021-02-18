import InternalPermissionMiddleware, {
  PERMISSION,
} from '../../middlewares/internal/permissions';
import { OPCODE, Wrapper } from '../../tools';

import InternalKickboardMiddleware from '../../middlewares/internal/kickboard';
import { Kickboard } from '../../controllers';
import { Packet } from 'kickboard-sdk';
import { Router } from 'express';
import getInternalAlarmRouter from './alarm';
import getInternalBatteryRouter from './battery';
import getInternalBluetoothRouter from './bluetooth';
import getInternalBuzzerRouter from './buzzer';
import getInternalConfigRouter from './config';
import getInternalInfoRouter from './info';
import getInternalLightRouter from './light';
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

  router.get(
    '/:kickboardId/start',
    InternalPermissionMiddleware(PERMISSION.ACTION_START),
    InternalKickboardMiddleware(),
    Wrapper(async (req, res) => {
      await Kickboard.start(req.kickboardClient);
      res.json({ opcode: OPCODE.SUCCESS });
    })
  );

  router.get(
    '/:kickboardId/stop',
    InternalPermissionMiddleware(PERMISSION.ACTION_STOP),
    InternalKickboardMiddleware(),
    Wrapper(async (req, res) => {
      await Kickboard.stop(req.kickboardClient);
      res.json({ opcode: OPCODE.SUCCESS });
    })
  );

  router.get(
    '/:kickboardId/lock',
    InternalPermissionMiddleware(PERMISSION.ACTION_LOCK),
    InternalKickboardMiddleware(),
    Wrapper(async (req, res) => {
      await Kickboard.lock(req.kickboardClient);
      res.json({ opcode: OPCODE.SUCCESS });
    })
  );

  router.get(
    '/:kickboardId/unlock',
    InternalPermissionMiddleware(PERMISSION.ACTION_UNLOCK),
    InternalKickboardMiddleware(),
    Wrapper(async (req, res) => {
      await Kickboard.unlock(req.kickboardClient);
      res.json({ opcode: OPCODE.SUCCESS });
    })
  );

  router.get(
    '/:kickboardId/reboot',
    InternalPermissionMiddleware(PERMISSION.ACTION_REBOOT),
    InternalKickboardMiddleware(),
    Wrapper(async (req, res) => {
      await Kickboard.reboot(req.kickboardClient);
      res.json({ opcode: OPCODE.SUCCESS });
    })
  );

  router.use(
    '/:kickboardId/buzzer',
    InternalKickboardMiddleware(),
    getInternalBuzzerRouter()
  );

  router.use(
    '/:kickboardId/bluetooth',
    InternalKickboardMiddleware(),
    getInternalBluetoothRouter()
  );

  router.use(
    '/:kickboardId/light',
    InternalKickboardMiddleware(),
    getInternalLightRouter()
  );

  router.use(
    '/:kickboardId/alarm',
    InternalKickboardMiddleware(),
    getInternalAlarmRouter()
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

import { Router } from 'express';
import { Packet } from 'kickboard-sdk';
import { Kickboard } from '../../controllers';
import InternalKickboardMiddleware from '../../middlewares/internal/kickboard';
import InternalPermissionMiddleware, {
  PERMISSION,
} from '../../middlewares/internal/permissions';
import { OPCODE, Wrapper } from '../../tools';
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
    '/:kickboardCode',
    InternalPermissionMiddleware(PERMISSION.LOOKUP),
    InternalPermissionMiddleware(PERMISSION.METHOD_LATEST),
    InternalKickboardMiddleware(),
    Wrapper(async (req, res) => {
      const { kickboard } = req;
      res.json({ opcode: OPCODE.SUCCESS, kickboard });
    })
  );

  router.post(
    '/:kickboardCode',
    InternalPermissionMiddleware(PERMISSION.ACTION_SET),
    Wrapper(async (req, res) => {
      const kickboard = await Kickboard.setKickboard(
        req.params.kickboardCode,
        req.body
      );

      res.json({ opcode: OPCODE.SUCCESS, kickboard });
    })
  );

  router.get(
    '/:kickboardCode/start',
    InternalPermissionMiddleware(PERMISSION.ACTION_START),
    InternalKickboardMiddleware(),
    Wrapper(async (req, res) => {
      await Kickboard.start(req.kickboardClient);
      res.json({ opcode: OPCODE.SUCCESS });
    })
  );

  router.get(
    '/:kickboardCode/stop',
    InternalPermissionMiddleware(PERMISSION.ACTION_STOP),
    InternalKickboardMiddleware(),
    Wrapper(async (req, res) => {
      await Kickboard.stop(req.kickboardClient);
      res.json({ opcode: OPCODE.SUCCESS });
    })
  );

  router.get(
    '/:kickboardCode/lock',
    InternalPermissionMiddleware(PERMISSION.ACTION_LOCK),
    InternalKickboardMiddleware(),
    Wrapper(async (req, res) => {
      await Kickboard.lock(req.kickboardClient);
      res.json({ opcode: OPCODE.SUCCESS });
    })
  );

  router.get(
    '/:kickboardCode/unlock',
    InternalPermissionMiddleware(PERMISSION.ACTION_UNLOCK),
    InternalKickboardMiddleware(),
    Wrapper(async (req, res) => {
      await Kickboard.unlock(req.kickboardClient);
      res.json({ opcode: OPCODE.SUCCESS });
    })
  );

  router.get(
    '/:kickboardCode/reboot',
    InternalPermissionMiddleware(PERMISSION.ACTION_REBOOT),
    InternalKickboardMiddleware(),
    Wrapper(async (req, res) => {
      await Kickboard.reboot(req.kickboardClient);
      res.json({ opcode: OPCODE.SUCCESS });
    })
  );

  router.use(
    '/:kickboardCode/buzzer',
    InternalKickboardMiddleware(),
    getInternalBuzzerRouter()
  );

  router.use(
    '/:kickboardCode/bluetooth',
    InternalKickboardMiddleware(),
    getInternalBluetoothRouter()
  );

  router.use(
    '/:kickboardCode/light',
    InternalKickboardMiddleware(),
    getInternalLightRouter()
  );

  router.use(
    '/:kickboardCode/alarm',
    InternalKickboardMiddleware(),
    getInternalAlarmRouter()
  );

  router.use(
    '/:kickboardCode/status',
    InternalPermissionMiddleware(PERMISSION.LOOKUP_STATUS),
    InternalKickboardMiddleware(),
    getInternalStatusRouter()
  );

  router.use(
    '/:kickboardCode/info',
    InternalPermissionMiddleware(PERMISSION.LOOKUP_INFO),
    InternalKickboardMiddleware(),
    getInternalInfoRouter()
  );

  router.use(
    '/:kickboardCode/config',
    InternalPermissionMiddleware(PERMISSION.LOOKUP_CONFIG),
    InternalKickboardMiddleware(),
    getInternalConfigRouter()
  );

  router.use(
    '/:kickboardCode/battery',
    InternalPermissionMiddleware(PERMISSION.LOOKUP_BATTERY),
    InternalKickboardMiddleware(),
    getInternalBatteryRouter()
  );

  router
    .use(InternalPermissionMiddleware(PERMISSION.LOOKUP))
    .use(InternalPermissionMiddleware(PERMISSION.METHOD_REALTIME))
    .use(InternalKickboardMiddleware())
    .ws('/:kickboardCode', async (ws, req) => {
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

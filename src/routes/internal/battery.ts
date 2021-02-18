import InternalPermissionMiddleware, {
  PERMISSION,
} from '../../middlewares/internal/permissions';
import { OPCODE, Wrapper } from '../../tools';

import { Battery } from '../../controllers';
import { PacketBattery } from 'kickboard-sdk';
import { Router } from 'express';

export default function getInternalBatteryRouter(): Router {
  const router = Router();

  router.get(
    '/',
    InternalPermissionMiddleware(PERMISSION.METHOD_LATEST),
    Wrapper(async (req, res) => {
      const battery = await Battery.getBattery(req.kickboardClient);
      res.json({ opcode: OPCODE.SUCCESS, battery });
    })
  );

  router.post(
    '/',
    InternalPermissionMiddleware(PERMISSION.METHOD_REFRESH),
    Wrapper(async (req, res) => {
      const battery = await Battery.refreshBattery(req.kickboardClient);
      res.json({ opcode: OPCODE.SUCCESS, battery });
    })
  );

  router.get(
    '/lock',
    InternalPermissionMiddleware(PERMISSION.ACTION_BATTERY_LOCK),
    Wrapper(async (req, res) => {
      await Battery.batteryLock(req.kickboardClient);
      res.json({ opcode: OPCODE.SUCCESS });
    })
  );

  router.get(
    '/unlock',
    InternalPermissionMiddleware(PERMISSION.ACTION_BATTERY_UNLOCK),
    Wrapper(async (req, res) => {
      await Battery.batteryUnlock(req.kickboardClient);
      res.json({ opcode: OPCODE.SUCCESS });
    })
  );

  router
    .use(InternalPermissionMiddleware(PERMISSION.METHOD_REALTIME))
    .ws('/', async (ws, req) => {
      const { kickboardClient } = req;
      const subscribe = await kickboardClient.createSubscribe();
      subscribe.on('battery', (packet: PacketBattery) => {
        ws.send(JSON.stringify(packet));
      });

      ws.on('close', () => {
        kickboardClient.stopSubscribe(subscribe);
      });

      await kickboardClient.startSubscribe(subscribe);
    });

  return router;
}

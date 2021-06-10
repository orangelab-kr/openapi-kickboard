import {
  Battery,
  InternalPermissionMiddleware,
  OPCODE,
  PERMISSION,
  Wrapper,
} from '../../..';

import { PacketBattery } from 'kickboard-sdk';
import { Router } from 'express';

export function getInternalKickboardsBatteryRouter(): Router {
  const router = Router();

  router.get(
    '/',
    InternalPermissionMiddleware(PERMISSION.KICKBOARD_METHOD_LATEST),
    Wrapper(async (req, res) => {
      const { kickboardClient } = req.internal;
      const battery = await Battery.getBattery(kickboardClient);
      res.json({ opcode: OPCODE.SUCCESS, battery });
    })
  );

  router.post(
    '/',
    InternalPermissionMiddleware(PERMISSION.KICKBOARD_METHOD_REFRESH),
    Wrapper(async (req, res) => {
      const { kickboardClient } = req.internal;
      const battery = await Battery.refreshBattery(kickboardClient);
      res.json({ opcode: OPCODE.SUCCESS, battery });
    })
  );

  router.get(
    '/lock',
    InternalPermissionMiddleware(PERMISSION.KICKBOARD_ACTION_BATTERY_LOCK),
    Wrapper(async (req, res) => {
      const { kickboardClient } = req.internal;
      await Battery.batteryLock(kickboardClient);
      res.json({ opcode: OPCODE.SUCCESS });
    })
  );

  router.get(
    '/unlock',
    InternalPermissionMiddleware(PERMISSION.KICKBOARD_ACTION_BATTERY_UNLOCK),
    Wrapper(async (req, res) => {
      const { kickboardClient } = req.internal;
      await Battery.batteryUnlock(kickboardClient);
      res.json({ opcode: OPCODE.SUCCESS });
    })
  );

  router
    .use(InternalPermissionMiddleware(PERMISSION.KICKBOARD_METHOD_REALTIME))
    .ws('/', async (ws, req) => {
      const { kickboardClient } = req.internal;
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
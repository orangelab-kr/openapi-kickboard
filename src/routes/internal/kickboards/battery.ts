import { Router } from 'express';
import { PacketBattery } from 'kickboard-sdk';
import {
  Battery,
  InternalPermissionMiddleware,
  PERMISSION,
  RESULT,
  Wrapper,
} from '../../..';

export function getInternalKickboardsBatteryRouter(): Router {
  const router = Router();

  router.get(
    '/',
    InternalPermissionMiddleware(PERMISSION.KICKBOARD_METHOD_LATEST),
    Wrapper(async (req) => {
      const { kickboardClient } = req.internal;
      const battery = await Battery.getBattery(kickboardClient);
      throw RESULT.SUCCESS({ details: { battery } });
    })
  );

  router.post(
    '/',
    InternalPermissionMiddleware(PERMISSION.KICKBOARD_METHOD_REFRESH),
    Wrapper(async (req) => {
      const { kickboardClient } = req.internal;
      const battery = await Battery.refreshBattery(kickboardClient);
      throw RESULT.SUCCESS({ details: { battery } });
    })
  );

  router.get(
    '/lock',
    InternalPermissionMiddleware(PERMISSION.KICKBOARD_ACTION_BATTERY_LOCK),
    Wrapper(async (req) => {
      const { kickboardClient } = req.internal;
      await Battery.batteryLock(kickboardClient);
      throw RESULT.SUCCESS();
    })
  );

  router.get(
    '/unlock',
    InternalPermissionMiddleware(PERMISSION.KICKBOARD_ACTION_BATTERY_UNLOCK),
    Wrapper(async (req) => {
      const { kickboardClient } = req.internal;
      await Battery.batteryUnlock(kickboardClient);
      throw RESULT.SUCCESS();
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

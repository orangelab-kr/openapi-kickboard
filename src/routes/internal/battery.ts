import InternalPermissionMiddleware, {
  PERMISSION,
} from '../../middlewares/internal/permissions';
import { OPCODE, Wrapper } from '../../tools';

import Battery from '../../controllers/battery';
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

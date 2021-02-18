import InternalPermissionMiddleware, {
  PERMISSION,
} from '../../middlewares/internal/permissions';
import { OPCODE, Wrapper } from '../../tools';

import { Config } from '../../controllers';
import { PacketConfig } from 'kickboard-sdk';
import { Router } from 'express';

export default function getInternalConfigRouter(): Router {
  const router = Router();

  router.get(
    '/',
    InternalPermissionMiddleware(PERMISSION.METHOD_LATEST),
    Wrapper(async (req, res) => {
      const config = await Config.getConfig(req.kickboardClient);
      res.json({ opcode: OPCODE.SUCCESS, config });
    })
  );

  router.post(
    '/',
    InternalPermissionMiddleware(PERMISSION.METHOD_REFRESH),
    Wrapper(async (req, res) => {
      const config = await Config.refreshConfig(req.kickboardClient);
      res.json({ opcode: OPCODE.SUCCESS, config });
    })
  );

  router
    .use(InternalPermissionMiddleware(PERMISSION.METHOD_REALTIME))
    .ws('/', async (ws, req) => {
      const { kickboardClient } = req;
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

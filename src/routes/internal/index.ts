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
  router.post(
    '/:kickboardId',
    Wrapper(async (req, res) => {
      const kickboard = await Kickboard.setKickboard(
        req.params.kickboardId,
        req.body
      );

      res.json({ opcode: OPCODE.SUCCESS, kickboard });
    })
  );

  router.use('/:kickboardId', InternalKickboardMiddleware());
  router.ws('/:kickboardId', async (ws, req) => {
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

  router.get(
    '/:kickboardId',
    Wrapper(async (req, res) => {
      const { kickboard } = req;
      res.json({ opcode: OPCODE.SUCCESS, kickboard });
    })
  );

  router.use('/:kickboardId/status', getInternalStatusRouter());
  router.use('/:kickboardId/info', getInternalInfoRouter());
  router.use('/:kickboardId/config', getInternalConfigRouter());
  router.use('/:kickboardId/battery', getInternalBatteryRouter());

  return router;
}

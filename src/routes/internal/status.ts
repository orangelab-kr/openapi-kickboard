import { OPCODE, Wrapper } from '../../tools';

import { PacketStatus } from 'kickboard-sdk';
import { Router } from 'express';
import Status from '../../controllers/status';

export default function getInternalStatusRouter(): Router {
  const router = Router();

  router.ws('/', async (ws, req) => {
    const { kickboardClient } = req;
    const subscribe = await kickboardClient.createSubscribe();
    subscribe.on('status', (packet: PacketStatus) => {
      ws.send(JSON.stringify(packet));
    });

    ws.on('close', () => {
      kickboardClient.stopSubscribe(subscribe);
    });

    await kickboardClient.startSubscribe(subscribe);
  });

  router.get(
    '/',
    Wrapper(async (req, res) => {
      const status = await Status.getStatus(req.kickboardClient);
      res.json({ opcode: OPCODE.SUCCESS, status });
    })
  );

  router.post(
    '/',
    Wrapper(async (req, res) => {
      const status = await Status.refreshStatus(req.kickboardClient);
      res.json({ opcode: OPCODE.SUCCESS, status });
    })
  );

  return router;
}

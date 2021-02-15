import { OPCODE, Wrapper } from '../../tools';

import Info from '../../controllers/info';
import { PacketInfo } from 'kickboard-sdk';
import { Router } from 'express';

export default function getInternalInfoRouter(): Router {
  const router = Router();

  router.ws('/', async (ws, req) => {
    const { kickboardClient } = req;
    const subscribe = await kickboardClient.createSubscribe();
    subscribe.on('info', (packet: PacketInfo) => {
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
      const info = await Info.getInfo(req.kickboardClient);
      res.json({ opcode: OPCODE.SUCCESS, info });
    })
  );

  router.post(
    '/',
    Wrapper(async (req, res) => {
      const info = await Info.refreshInfo(req.kickboardClient);
      res.json({ opcode: OPCODE.SUCCESS, info });
    })
  );

  return router;
}

import { OPCODE, Wrapper } from '../../tools';

import Battery from '../../controllers/battery';
import { PacketBattery } from 'kickboard-sdk';
import { Router } from 'express';

export default function getInternalBatteryRouter(): Router {
  const router = Router();

  router.ws('/', async (ws, req) => {
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

  router.get(
    '/',
    Wrapper(async (req, res) => {
      const battery = await Battery.getBattery(req.kickboardClient);
      res.json({ opcode: OPCODE.SUCCESS, battery });
    })
  );

  router.post(
    '/',
    Wrapper(async (req, res) => {
      const battery = await Battery.refreshBattery(req.kickboardClient);
      res.json({ opcode: OPCODE.SUCCESS, battery });
    })
  );

  return router;
}

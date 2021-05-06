import {
  InternalKickboardMiddleware,
  InternalPermissionMiddleware,
  Kickboard,
  OPCODE,
  PERMISSION,
  Wrapper,
  getInternalAlarmRouter,
  getInternalBatteryRouter,
  getInternalBluetoothRouter,
  getInternalBuzzerRouter,
  getInternalConfigRouter,
  getInternalInfoRouter,
  getInternalLightRouter,
  getInternalStatusRouter,
} from '../..';

import { Packet } from 'kickboard-sdk';
import { Router } from 'express';

export * from './alarm';
export * from './battery';
export * from './bluetooth';
export * from './buzzer';
export * from './config';
export * from './info';
export * from './light';
export * from './status';

export function getInternalRouter(): Router {
  const router = Router();

  router.get(
    '/',
    InternalPermissionMiddleware(PERMISSION.LOOKUP_DETAIL),
    InternalPermissionMiddleware(PERMISSION.SEARCH_LIST),
    InternalPermissionMiddleware(PERMISSION.METHOD_LATEST),
    Wrapper(async (req, res) => {
      const { query } = req;
      const { total, kickboards } = await Kickboard.getKickboardDocs(query);
      res.json({ opcode: OPCODE.SUCCESS, kickboards, total });
    })
  );

  router.get(
    '/near',
    InternalPermissionMiddleware(PERMISSION.LOOKUP_DETAIL),
    InternalPermissionMiddleware(PERMISSION.SEARCH_NEAR),
    InternalPermissionMiddleware(PERMISSION.METHOD_LATEST),
    Wrapper(async (req, res) => {
      const { query } = req;
      const { total, kickboards } = await Kickboard.getNearKickboards(
        query,
        true
      );

      res.json({ opcode: OPCODE.SUCCESS, kickboards, total });
    })
  );

  router.get(
    '/:kickboardCode',
    InternalPermissionMiddleware(PERMISSION.LOOKUP_DETAIL),
    InternalPermissionMiddleware(PERMISSION.METHOD_LATEST),
    InternalKickboardMiddleware(),
    Wrapper(async (req, res) => {
      const { kickboard } = req.internal;
      res.json({ opcode: OPCODE.SUCCESS, kickboard });
    })
  );

  router.post(
    '/:kickboardCode',
    InternalPermissionMiddleware(PERMISSION.ACTION_SET),
    Wrapper(async (req, res) => {
      const { body, params } = req;
      const kickboard = await Kickboard.setKickboard(
        params.kickboardCode,
        body
      );

      res.json({ opcode: OPCODE.SUCCESS, kickboard });
    })
  );

  router.get(
    '/:kickboardCode/start',
    InternalPermissionMiddleware(PERMISSION.ACTION_START),
    InternalKickboardMiddleware(),
    Wrapper(async (req, res) => {
      const { kickboardClient, kickboard } = req.internal;
      await Kickboard.start(kickboard, kickboardClient);
      res.json({ opcode: OPCODE.SUCCESS });
    })
  );

  router.get(
    '/:kickboardCode/stop',
    InternalPermissionMiddleware(PERMISSION.ACTION_STOP),
    InternalKickboardMiddleware(),
    Wrapper(async (req, res) => {
      const { kickboardClient, kickboard } = req.internal;
      await Kickboard.stop(kickboard, kickboardClient);
      res.json({ opcode: OPCODE.SUCCESS });
    })
  );

  router.get(
    '/:kickboardCode/lock',
    InternalPermissionMiddleware(PERMISSION.ACTION_LOCK),
    InternalKickboardMiddleware(),
    Wrapper(async (req, res) => {
      const { kickboardClient } = req.internal;
      await Kickboard.lock(kickboardClient);
      res.json({ opcode: OPCODE.SUCCESS });
    })
  );

  router.get(
    '/:kickboardCode/unlock',
    InternalPermissionMiddleware(PERMISSION.ACTION_UNLOCK),
    InternalKickboardMiddleware(),
    Wrapper(async (req, res) => {
      const { kickboardClient } = req.internal;
      await Kickboard.unlock(kickboardClient);
      res.json({ opcode: OPCODE.SUCCESS });
    })
  );

  router.get(
    '/:kickboardCode/reboot',
    InternalPermissionMiddleware(PERMISSION.ACTION_REBOOT),
    InternalKickboardMiddleware(),
    Wrapper(async (req, res) => {
      const { kickboardClient } = req.internal;
      await Kickboard.reboot(kickboardClient);
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
    .use(InternalPermissionMiddleware(PERMISSION.LOOKUP_DETAIL))
    .use(InternalPermissionMiddleware(PERMISSION.METHOD_REALTIME))
    .use(InternalKickboardMiddleware())
    .ws('/:kickboardCode', async (ws, req) => {
      const { kickboardClient } = req.internal;
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

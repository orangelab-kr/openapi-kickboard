import { Router } from 'express';
import { Packet } from '@hikick/kickboard-sdk';
import {
  getInternalKickboardsAlarmRouter,
  getInternalKickboardsBatteryRouter,
  getInternalKickboardsBluetoothRouter,
  getInternalKickboardsBuzzerRouter,
  getInternalKickboardsConfigRouter,
  getInternalKickboardsInfoRouter,
  getInternalKickboardsLightRouter,
  getInternalKickboardsStatusRouter,
  InternalKickboardMiddleware,
  InternalPermissionMiddleware,
  Kickboard,
  PERMISSION,
  RESULT,
  Wrapper,
} from '../../..';

export * from './alarm';
export * from './battery';
export * from './bluetooth';
export * from './buzzer';
export * from './config';
export * from './info';
export * from './light';
export * from './status';

export function getInternalKickboardsRouter() {
  const router = Router();

  router.get(
    '/',
    InternalPermissionMiddleware(PERMISSION.KICKBOARD_LOOKUP_DETAIL),
    InternalPermissionMiddleware(PERMISSION.KICKBOARD_SEARCH_LIST),
    InternalPermissionMiddleware(PERMISSION.KICKBOARD_METHOD_LATEST),
    Wrapper(async (req) => {
      const { query } = req;
      const { total, kickboards } = await Kickboard.getKickboards(query);
      throw RESULT.SUCCESS({ details: { kickboards, total } });
    })
  );

  // Legacy: 헬멧 미장착
  router.get(
    '/helmet-unmount',
    InternalPermissionMiddleware(PERMISSION.KICKBOARD_LOOKUP_DETAIL),
    InternalPermissionMiddleware(PERMISSION.KICKBOARD_SEARCH_LIST),
    InternalPermissionMiddleware(PERMISSION.KICKBOARD_METHOD_LATEST),
    Wrapper(async (req) => {
      const { query } = req;
      const { total, kickboards } = await Kickboard.getKickboardByHelmetUnmount(
        query
      );

      throw RESULT.SUCCESS({ details: { kickboards, total } });
    })
  );

  router.get(
    '/near',
    InternalPermissionMiddleware(PERMISSION.KICKBOARD_LOOKUP_DETAIL),
    InternalPermissionMiddleware(PERMISSION.KICKBOARD_SEARCH_NEAR),
    InternalPermissionMiddleware(PERMISSION.KICKBOARD_METHOD_LATEST),
    Wrapper(async (req) => {
      const { query } = req;
      const { total, kickboards } = await Kickboard.getNearKickboards(
        query,
        true
      );

      throw RESULT.SUCCESS({ details: { kickboards, total } });
    })
  );

  router.get(
    '/:kickboardCode',
    InternalPermissionMiddleware(PERMISSION.KICKBOARD_LOOKUP_DETAIL),
    InternalPermissionMiddleware(PERMISSION.KICKBOARD_METHOD_LATEST),
    InternalKickboardMiddleware(true),
    Wrapper(async (req) => {
      const { kickboard } = req.internal;
      throw RESULT.SUCCESS({ details: { kickboard } });
    })
  );

  router.post(
    '/:kickboardCode',
    InternalPermissionMiddleware(PERMISSION.KICKBOARD_ACTION_SET),
    Wrapper(async (req) => {
      const { body, params } = req;
      const kickboard = await Kickboard.setKickboard(
        params.kickboardCode,
        body
      );

      throw RESULT.SUCCESS({ details: { kickboard } });
    })
  );

  router.delete(
    '/:kickboardCode',
    InternalPermissionMiddleware(PERMISSION.KICKBOARD_ACTION_SET),
    Wrapper(async (req) => {
      await Kickboard.removeKickboard(req.params.kickboardCode);
      throw RESULT.SUCCESS();
    })
  );

  router.get(
    '/:kickboardCode/start',
    InternalPermissionMiddleware(PERMISSION.KICKBOARD_ACTION_START),
    InternalKickboardMiddleware(),
    Wrapper(async (req) => {
      const { kickboardClient, kickboard } = req.internal;
      await Kickboard.start(kickboard, kickboardClient);
      throw RESULT.SUCCESS();
    })
  );

  router.get(
    '/:kickboardCode/stop',
    InternalPermissionMiddleware(PERMISSION.KICKBOARD_ACTION_STOP),
    InternalKickboardMiddleware(),
    Wrapper(async (req) => {
      const { kickboardClient, kickboard } = req.internal;
      await Kickboard.stop(kickboard, kickboardClient);
      throw RESULT.SUCCESS();
    })
  );

  router.get(
    '/:kickboardCode/lock',
    InternalPermissionMiddleware(PERMISSION.KICKBOARD_ACTION_LOCK),
    InternalKickboardMiddleware(),
    Wrapper(async (req) => {
      const { kickboardClient } = req.internal;
      await Kickboard.lock(kickboardClient);
      throw RESULT.SUCCESS();
    })
  );

  router.get(
    '/:kickboardCode/unlock',
    InternalPermissionMiddleware(PERMISSION.KICKBOARD_ACTION_UNLOCK),
    InternalKickboardMiddleware(),
    Wrapper(async (req) => {
      const { kickboardClient } = req.internal;
      await Kickboard.unlock(kickboardClient);
      throw RESULT.SUCCESS();
    })
  );

  router.get(
    '/:kickboardCode/timeline',
    InternalPermissionMiddleware(PERMISSION.KICKBOARD_METHOD_TIMELINE),
    InternalKickboardMiddleware(),
    Wrapper(async (req) => {
      const { kickboard, kickboardClient } = req.internal;
      const opts = { kickboard, kickboardClient };
      const timeline = await Kickboard.getLatestRideTimeline(opts, true);
      throw RESULT.SUCCESS({ details: { timeline } });
    })
  );

  router.get(
    '/:kickboardCode/reboot',
    InternalPermissionMiddleware(PERMISSION.KICKBOARD_ACTION_REBOOT),
    InternalKickboardMiddleware(),
    Wrapper(async (req) => {
      const { kickboardClient } = req.internal;
      await Kickboard.reboot(kickboardClient);
      throw RESULT.SUCCESS();
    })
  );

  router.use(
    '/:kickboardCode/buzzer',
    InternalKickboardMiddleware(),
    getInternalKickboardsBuzzerRouter()
  );

  router.use(
    '/:kickboardCode/bluetooth',
    InternalKickboardMiddleware(),
    getInternalKickboardsBluetoothRouter()
  );

  router.use(
    '/:kickboardCode/light',
    InternalKickboardMiddleware(),
    getInternalKickboardsLightRouter()
  );

  router.use(
    '/:kickboardCode/alarm',
    InternalKickboardMiddleware(),
    getInternalKickboardsAlarmRouter()
  );

  router.use(
    '/:kickboardCode/status',
    InternalPermissionMiddleware(PERMISSION.KICKBOARD_LOOKUP_STATUS),
    InternalKickboardMiddleware(),
    getInternalKickboardsStatusRouter()
  );

  router.use(
    '/:kickboardCode/info',
    InternalPermissionMiddleware(PERMISSION.KICKBOARD_LOOKUP_INFO),
    InternalKickboardMiddleware(),
    getInternalKickboardsInfoRouter()
  );

  router.use(
    '/:kickboardCode/config',
    InternalPermissionMiddleware(PERMISSION.KICKBOARD_LOOKUP_CONFIG),
    InternalKickboardMiddleware(),
    getInternalKickboardsConfigRouter()
  );

  router.use(
    '/:kickboardCode/battery',
    InternalPermissionMiddleware(PERMISSION.KICKBOARD_LOOKUP_BATTERY),
    InternalKickboardMiddleware(),
    getInternalKickboardsBatteryRouter()
  );

  router
    .use(InternalPermissionMiddleware(PERMISSION.KICKBOARD_LOOKUP_DETAIL))
    .use(InternalPermissionMiddleware(PERMISSION.KICKBOARD_METHOD_REALTIME))
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

import { Router } from 'express';
import {
  clusterInfo,
  getInternalRouter,
  InternalMiddleware,
  Kickboard,
  KickboardMiddleware,
  KickboardMode,
  PlatformMiddleware,
  RESULT,
  Wrapper,
} from '..';

export * from './internal';

export function getRouter(): Router {
  const router = Router();

  router.use('/internal', InternalMiddleware(), getInternalRouter());
  router.get(
    '/',
    Wrapper(async (_req, res) => {
      throw RESULT.SUCCESS({ details: clusterInfo });
    })
  );

  router.get(
    '/near',
    PlatformMiddleware({ permissionIds: ['kickboards.list'], final: true }),
    Wrapper(async (req) => {
      const { query } = req;
      const { total, kickboards } = await Kickboard.getNearKickboards(
        { ...query, mode: [KickboardMode.READY] },
        false
      );

      throw RESULT.SUCCESS({ details: { kickboards, total } });
    })
  );

  router.post(
    '/qrcode',
    PlatformMiddleware({ permissionIds: ['kickboards.view'], final: true }),
    Wrapper(async (req) => {
      const { url } = req.body;
      const kickboardCode = await Kickboard.getKickboardCodeByQrcode(url);
      throw RESULT.SUCCESS({ details: { kickboardCode } });
    })
  );

  router.get(
    '/:kickboardCode',
    PlatformMiddleware({ permissionIds: ['kickboards.view'], final: true }),
    KickboardMiddleware(),
    Wrapper(async (req) => {
      const { kickboard } = req;
      throw RESULT.SUCCESS({ details: { kickboard } });
    })
  );

  router.get(
    '/:kickboardCode/timeline',
    PlatformMiddleware({ permissionIds: ['kickboards.timeline'], final: true }),
    KickboardMiddleware(),
    Wrapper(async (req) => {
      const { kickboard, kickboardClient } = req;
      const opts = { kickboard, kickboardClient };
      const timeline = await Kickboard.getLatestRideTimeline(opts, false);
      throw RESULT.SUCCESS({ details: { timeline } });
    })
  );

  router.all(
    '*',
    Wrapper(async () => {
      throw RESULT.INVALID_API();
    })
  );

  return router;
}

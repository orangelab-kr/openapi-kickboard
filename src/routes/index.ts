import { Router } from 'express';
import {
  clusterInfo,
  getInternalRouter,
  InternalMiddleware,
  Kickboard,
  KickboardMiddleware,
  KickboardMode,
  OPCODE,
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
      res.json({
        opcode: OPCODE.SUCCESS,
        ...clusterInfo,
      });
    })
  );

  router.get(
    '/near',
    PlatformMiddleware({ permissionIds: ['kickboards.list'], final: true }),
    Wrapper(async (req, res) => {
      const { query } = req;
      const { total, kickboards } = await Kickboard.getNearKickboards(
        { ...query, status: [KickboardMode.READY] },
        false
      );

      res.json({ opcode: OPCODE.SUCCESS, kickboards, total });
    })
  );

  router.get(
    '/:kickboardCode',
    PlatformMiddleware({ permissionIds: ['kickboards.view'], final: true }),
    KickboardMiddleware(),
    Wrapper(async (req, res) => {
      const { kickboard } = req;
      res.json({ opcode: OPCODE.SUCCESS, kickboard });
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

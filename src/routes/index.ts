import { Router } from 'express';
import {
  clusterInfo,
  getInternalRouter,
  InternalError,
  InternalMiddleware,
  Kickboard,
  KickboardMiddleware,
  KickboardMode,
  OPCODE,
  PlatformMiddleware,
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
    PlatformMiddleware(),
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
    PlatformMiddleware(),
    KickboardMiddleware(),
    Wrapper(async (req, res) => {
      const { kickboard } = req;
      res.json({ opcode: OPCODE.SUCCESS, kickboard });
    })
  );

  router.all(
    '*',
    Wrapper(async () => {
      throw new InternalError('Invalid API');
    })
  );

  return router;
}

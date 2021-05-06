import {
  InternalError,
  InternalMiddleware,
  Kickboard,
  KickboardMiddleware,
  KickboardMode,
  OPCODE,
  PlatformMiddleware,
  Wrapper,
  getInternalRouter,
  logger,
} from '..';
import express, { Router } from 'express';

import cors from 'cors';
import morgan from 'morgan';
import os from 'os';

export * from './internal';

export function getRouter(): Router {
  const router = Router();
  const hostname = os.hostname();
  const logging = morgan('common', {
    stream: { write: (str: string) => logger.info(`${str.trim()}`) },
  });

  router.use(cors());
  router.use(logging);
  router.use(express.json());
  router.use(express.urlencoded({ extended: true }));
  router.use('/internal', InternalMiddleware(), getInternalRouter());
  router.get(
    '/',
    Wrapper(async (_req, res) => {
      res.json({
        opcode: OPCODE.SUCCESS,
        name: process.env.npm_package_name,
        mode: process.env.NODE_ENV,
        version: process.env.npm_package_version,
        cluster: hostname,
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

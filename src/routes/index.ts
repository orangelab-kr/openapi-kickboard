import { InternalError, OPCODE, Wrapper, logger } from '../tools';
import express, { Router } from 'express';

import InternalMiddleware from '../middlewares/internal';
import { Kickboard } from '../controllers';
import KickboardMiddleware from '../middlewares/kickboard';
import { KickboardMode } from '../models';
import { PlatformMiddleware } from '../middlewares/platform';
import cors from 'cors';
import getInternalRouter from './internal';
import morgan from 'morgan';
import os from 'os';

export default function getRouter(): Router {
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

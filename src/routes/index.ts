import { InternalError, OPCODE, Wrapper, logger } from '../tools';
import express, { Router } from 'express';

import InternalMiddleware from '../middlewares/internal';
import { Kickboard } from '../controllers';
import KickboardMiddleware from '../middlewares/kickboard';
import getInternalRouter from './internal';
import morgan from 'morgan';
import os from 'os';

export default function getRouter(): Router {
  const router = Router();
  const hostname = os.hostname();
  const logging = morgan('common', {
    stream: { write: (str: string) => logger.info(`${str.trim()}`) },
  });

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
    '/search',
    Wrapper(async (req, res) => {
      const { query } = req;
      const kickboards = await Kickboard.getKickboardsByRadius(query, false);
      res.json({ opcode: OPCODE.SUCCESS, kickboards });
    })
  );

  router.get(
    '/:kickboardCode',
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

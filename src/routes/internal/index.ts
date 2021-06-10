import { Router } from 'express';
import { getInternalKickboardsRouter } from '.';

export * from './kickboards';

export function getInternalRouter(): Router {
  const router = Router();

  router.use('/kickboards', getInternalKickboardsRouter());

  return router;
}

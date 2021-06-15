import { Router } from 'express';
import { getInternalHelmetsRouter, getInternalKickboardsRouter } from '.';

export * from './helmets';
export * from './kickboards';

export function getInternalRouter(): Router {
  const router = Router();

  router.use('/kickboards', getInternalKickboardsRouter());
  router.use('/helmets', getInternalHelmetsRouter());

  return router;
}

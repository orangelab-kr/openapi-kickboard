import { Router } from 'express';
import {
  Helmet,
  InternalHelmetByMacMiddleware,
  InternalHelmetMiddleware,
  RESULT,
  Wrapper,
} from '../..';

export function getInternalHelmetsRouter() {
  const router = Router();

  router.get(
    '/',
    Wrapper(async (req, res) => {
      const { helmets, total } = await Helmet.getHelmets(req.query);
      throw RESULT.SUCCESS({ details: { helmets, total } });
    })
  );

  router.post(
    '/',
    Wrapper(async (req, res) => {
      const helmet = await Helmet.createHelmet(req.body);
      throw RESULT.SUCCESS({ details: { helmet } });
    })
  );

  router.post(
    '/:helmetId',
    InternalHelmetMiddleware(),
    Wrapper(async (req, res) => {
      const { internal, body } = req;
      const helmet = await Helmet.modifyHelmet(internal.helmet, body);
      throw RESULT.SUCCESS({ details: { helmet } });
    })
  );

  router.get(
    '/:helmetId',
    InternalHelmetMiddleware(),
    Wrapper(async (req, res) => {
      const { helmet } = req.internal;
      throw RESULT.SUCCESS({ details: { helmet } });
    })
  );

  router.get(
    '/byMac/:macAddress',
    InternalHelmetByMacMiddleware(),
    Wrapper(async (req, res) => {
      const { helmet } = req.internal;
      throw RESULT.SUCCESS({ details: { helmet } });
    })
  );

  router.delete(
    '/:helmetId',
    InternalHelmetMiddleware(),
    Wrapper(async (req, res) => {
      await Helmet.deleteHelmet(req.internal.helmet);
      throw RESULT.SUCCESS();
    })
  );

  return router;
}

import { Router } from 'express';
import { Helmet, InternalHelmetMiddleware, OPCODE, Wrapper } from '../..';

export function getInternalHelmetsRouter() {
  const router = Router();

  router.get(
    '/',
    Wrapper(async (req, res) => {
      const { helmets, total } = await Helmet.getHelmets(req.query);
      res.json({ opcode: OPCODE.SUCCESS, helmets, total });
    })
  );

  router.post(
    '/',
    Wrapper(async (req, res) => {
      const helmet = await Helmet.createHelmet(req.body);
      res.json({ opcode: OPCODE.SUCCESS, helmet });
    })
  );

  router.post(
    '/:helmetId',
    InternalHelmetMiddleware(),
    Wrapper(async (req, res) => {
      const { internal, body } = req;
      const helmet = await Helmet.modifyHelmet(internal.helmet, body);
      res.json({ opcode: OPCODE.SUCCESS, helmet });
    })
  );

  router.get(
    '/:helmetId',
    InternalHelmetMiddleware(),
    Wrapper(async (req, res) => {
      const { helmet } = req.internal;
      res.json({ opcode: OPCODE.SUCCESS, helmet });
    })
  );

  router.delete(
    '/:helmetId',
    InternalHelmetMiddleware(),
    Wrapper(async (req, res) => {
      await Helmet.deleteHelmet(req.internal.helmet);
      res.json({ opcode: OPCODE.SUCCESS });
    })
  );

  return router;
}

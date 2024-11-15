import cors from 'cors';
import express from 'express';
import expressWs from 'express-ws';
import i18n from 'i18n';
import {
  getRouter,
  Kickboard,
  logger,
  LoggerMiddleware,
  MongoDB,
  registerSentry,
} from '.';

export * from './controllers';
export * from './middlewares';
export * from './models';
export * from './queries';
export * from './routes';
export * from './tools';

async function main() {
  logger.info('System / 시스템을 활성화하고 있습니다.');
  await MongoDB.init();
  await Kickboard.init();
  const { app } = expressWs(express());
  registerSentry(app);

  app.use(cors());
  app.use(i18n.init);
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(LoggerMiddleware());
  app.use('/v1/kickboard', getRouter());
  app.listen(process.env.WEB_PORT, () => {
    logger.info('System / 시스템이 준비되었습니다.');
  });
}

main();

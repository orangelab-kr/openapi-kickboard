import Kickboard from './controllers/kickboard';
import MongoDB from './tools/mongodb';
import dotenv from 'dotenv';
import express from 'express';
import expressWs from 'express-ws';
import getRouter from './routes';
import logger from './tools/logger';

if (process.env.NODE_ENV === 'dev') dotenv.config();

async function main() {
  logger.info('[System] 시스템을 활성화하고 있습니다.');
  await MongoDB.init();
  await Kickboard.init();
  const { app } = expressWs(express());
  app.use('/v1/kickboard', getRouter());
  app.listen(process.env.WEB_PORT, () => {
    logger.info('[System] 시스템이 준비되었습니다.');
  });
}

main();

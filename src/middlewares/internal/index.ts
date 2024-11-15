import dayjs from 'dayjs';
import jwt from 'jsonwebtoken';
import { Joi, logger, RESULT, Wrapper, WrapperCallback } from '../..';

export * from './helmet';
export * from './kickboard';
export * from './permissions';

export function InternalMiddleware(): WrapperCallback {
  return Wrapper(async (req, res, next) => {
    const { headers, query } = req;
    const token = headers.authorization
      ? headers.authorization.substr(7)
      : query.token;

    if (typeof token !== 'string') throw RESULT.REQUIRED_ACCESS_KEY();
    const key = process.env.HIKICK_OPENAPI_KICKBOARD_KEY;
    if (!key || !token) throw RESULT.REQUIRED_ACCESS_KEY();

    try {
      const data = jwt.verify(token, key);
      const schema = Joi.object({
        sub: Joi.string().valid('openapi-kickboard').required(),
        iss: Joi.string().required(),
        aud: Joi.string().email().required(),
        prs: Joi.string().required(),
        iat: Joi.date().timestamp().required(),
        exp: Joi.date().timestamp().required(),
      });

      const payload = await schema.validateAsync(data);
      const iat = dayjs(payload.iat);
      const exp = dayjs(payload.exp);
      const prs = parseInt(payload.prs, 36)
        .toString(2)
        .padStart(128, '0')
        .split('')
        .reverse()
        .map((v) => v === '1');

      req.internal = payload;
      req.internal.prs = prs;
      if (exp.diff(iat, 'hours') > 6) throw RESULT.EXPIRED_ACCESS_KEY();
      logger.info(
        `[Internal] [${payload.iss}] ${payload.aud} - ${req.method} ${req.originalUrl}`
      );
    } catch (err: any) {
      throw RESULT.REQUIRED_ACCESS_KEY();
    }

    await next();
  });
}

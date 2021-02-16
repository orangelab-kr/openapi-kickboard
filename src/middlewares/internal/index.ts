import { Joi, OPCODE, logger } from '../../tools';
import Wrapper, { Callback } from '../../tools/wrapper';

import InternalError from '../../tools/error';
import jwt from 'jsonwebtoken';
import moment from 'moment';

export * from './kickboard';
export * from './permissions';
export default function InternalMiddleware(): Callback {
  return Wrapper(async (req, res, next) => {
    const { headers, query } = req;
    const token = headers.authorization
      ? headers.authorization.substr(7)
      : query.token;

    if (typeof token !== 'string') {
      throw new InternalError(
        '인증이 필요한 서비스입니다.',
        OPCODE.REQUIRED_INTERAL_LOGIN
      );
    }

    const key = process.env.HIKICK_OPENAPI_KICKBOARD_KEY;
    if (!key || !token) {
      throw new InternalError(
        '인증이 필요한 서비스입니다.',
        OPCODE.REQUIRED_INTERAL_LOGIN
      );
    }

    try {
      const data = jwt.verify(token, key);
      const schema = Joi.object({
        sub: Joi.string().valid('openapi-kickboard').required(),
        iss: Joi.string().hostname().required(),
        aud: Joi.string().email().required(),
        prs: Joi.array().items(Joi.string()).required(),
        iat: Joi.date().timestamp().required(),
        exp: Joi.date().timestamp().required(),
      });

      const payload = await schema.validateAsync(data);
      const iat = moment(payload.iat);
      const exp = moment(payload.exp);

      req.internal = payload;
      if (exp.diff(iat, 'hours') > 6) throw Error();
      logger.info(
        `[Internal] [${payload.iss}] ${payload.aud} - ${req.method} ${req.originalUrl}`
      );
    } catch (err) {
      throw new InternalError(
        '인증이 필요한 서비스입니다.',
        OPCODE.REQUIRED_INTERAL_LOGIN
      );
    }

    await next();
  });
}

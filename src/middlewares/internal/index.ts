import Wrapper, { Callback } from '../../tools/wrapper';

import InternalError from '../../tools/error';
import { OPCODE } from '../../tools';
import jwt from 'jsonwebtoken';

export default function InternalMiddleware(): Callback {
  return Wrapper(async (req, res, next) => {
    const { authorization } = req.headers;
    if (!authorization) {
      throw new InternalError(
        '인증이 필요한 서비스입니다.',
        OPCODE.REQUIRED_INTERAL_LOGIN
      );
    }

    const key = process.env.HIKICK_OPENAPI_PLATFORM_KEY;
    const bearer = authorization.substr(7);
    if (!key || !bearer) {
      throw new InternalError(
        '인증이 필요한 서비스입니다.',
        OPCODE.REQUIRED_INTERAL_LOGIN
      );
    }

    try {
      jwt.verify(bearer, key);
    } catch (err) {
      throw new InternalError(
        '인증이 필요한 서비스입니다.',
        OPCODE.REQUIRED_INTERAL_LOGIN
      );
    }

    await next();
  });
}

import { Callback, Helmet, InternalError, OPCODE, Wrapper } from '../..';

export function InternalHelmetMiddleware(): Callback {
  return Wrapper(async (req, res, next) => {
    const { helmetId } = req.params;
    if (!helmetId) {
      throw new InternalError('헬멧을 찾을 수 없습니다.', OPCODE.NOT_FOUND);
    }

    req.internal.helmet = await Helmet.getHelmetOrThrow(helmetId);
    await next();
  });
}

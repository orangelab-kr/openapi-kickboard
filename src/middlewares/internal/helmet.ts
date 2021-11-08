import { Helmet, RESULT, Wrapper, WrapperCallback } from '../..';

export function InternalHelmetMiddleware(): WrapperCallback {
  return Wrapper(async (req, res, next) => {
    const { helmetId } = req.params;
    if (!helmetId) throw RESULT.CANNOT_FIND_HELMET();
    req.internal.helmet = await Helmet.getHelmetOrThrow(helmetId);
    next();
  });
}

export function InternalHelmetByMacMiddleware(): WrapperCallback {
  return Wrapper(async (req, res, next) => {
    const { macAddress } = req.params;
    if (!macAddress) throw RESULT.CANNOT_FIND_HELMET();
    req.internal.helmet = await Helmet.getHelmetByMacOrThrow(macAddress);
    next();
  });
}

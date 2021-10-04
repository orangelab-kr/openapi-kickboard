import { Kickboard, RESULT, Wrapper, WrapperCallback } from '../..';

export function InternalKickboardMiddleware(): WrapperCallback {
  const { kickboardService } = Kickboard;
  return Wrapper(async (req, res, next) => {
    const { kickboardCode } = req.params;
    if (!kickboardCode) throw RESULT.CANNOT_FIND_KICKBOARD();
    const code = kickboardCode.toUpperCase();
    req.internal.kickboard = await Kickboard.getKickboardDocOrThrow(code);

    const { kickboardId } = req.internal.kickboard;
    req.internal.kickboardClient = kickboardService.getKickboard(kickboardId);
    await next();
  });
}

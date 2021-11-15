import { Kickboard, RESULT, Wrapper, WrapperCallback } from '../..';

export function InternalKickboardMiddleware(details = false): WrapperCallback {
  const { kickboardService } = Kickboard;
  return Wrapper(async (req, res, next) => {
    const { kickboardCode } = req.params;
    if (!kickboardCode) throw RESULT.CANNOT_FIND_KICKBOARD();
    const code = kickboardCode.toUpperCase();
    req.internal.kickboard = await Kickboard.getKickboard(code, details);

    const { kickboardId } = req.internal.kickboard;
    req.internal.kickboardClient = kickboardService.getKickboard(kickboardId);
    next();
  });
}

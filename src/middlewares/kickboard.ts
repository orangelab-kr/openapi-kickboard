import { Kickboard, RESULT, Wrapper, WrapperCallback } from '..';

export function KickboardMiddleware(): WrapperCallback {
  const { kickboardService } = Kickboard;
  return Wrapper(async (req, res, next) => {
    const { kickboardCode } = req.params;
    if (!kickboardCode) throw RESULT.CANNOT_FIND_KICKBOARD();
    const code = kickboardCode.toUpperCase();
    req.kickboard = await Kickboard.getKickboard(code, false);

    const { kickboardId } = req.kickboard;
    req.kickboardClient = kickboardService.getKickboard(kickboardId);
    next();
  });
}

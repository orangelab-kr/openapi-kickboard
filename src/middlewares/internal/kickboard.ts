import Kickboard from '../../controllers/kickboard';
import { InternalError, OPCODE } from '../../tools';
import Wrapper, { Callback } from '../../tools/wrapper';

export default function InternalKickboardMiddleware(): Callback {
  const { kickboardService } = Kickboard;
  return Wrapper(async (req, res, next) => {
    const { kickboardCode } = req.params;
    if (!kickboardCode) {
      throw new InternalError(
        '해당 킥보드를 찾을 수 없습니다.',
        OPCODE.NOT_FOUND
      );
    }

    req.internal.kickboard = await Kickboard.getKickboardDocOrThrow(
      kickboardCode.toUpperCase()
    );

    req.internal.kickboardClient = kickboardService.getKickboard(
      req.internal.kickboard.kickboardId
    );

    await next();
  });
}

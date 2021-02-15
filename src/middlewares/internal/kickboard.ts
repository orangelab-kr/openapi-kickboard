import { InternalError, OPCODE } from '../../tools';
import Wrapper, { Callback } from '../../tools/wrapper';

import Kickboard from '../../controllers/kickboard';

export default function InternalKickboardMiddleware(): Callback {
  const { kickboardService } = Kickboard;
  return Wrapper(async (req, res, next) => {
    const { kickboardId } = req.params;
    if (!kickboardId) {
      throw new InternalError(
        '해당 킥보드를 찾을 수 없습니다.',
        OPCODE.NOT_FOUND
      );
    }

    req.kickboard = await Kickboard.getKickboardOrThrow(kickboardId);
    req.kickboardClient = kickboardService.getKickboard(kickboardId);
    await next();
  });
}

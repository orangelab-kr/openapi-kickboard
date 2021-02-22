import { InternalError, OPCODE } from '../tools';
import Wrapper, { Callback } from '../tools/wrapper';

import Kickboard from '../controllers/kickboard';

export default function KickboardMiddleware(): Callback {
  return Wrapper(async (req, res, next) => {
    const { kickboardCode } = req.params;
    if (!kickboardCode) {
      throw new InternalError(
        '해당 킥보드를 찾을 수 없습니다.',
        OPCODE.NOT_FOUND
      );
    }

    const code = kickboardCode.toUpperCase();
    req.kickboard = await Kickboard.getKickboard(code, false);
    await next();
  });
}

import { InternalError } from '.';
import logger from './logger';
import OPCODE from './opcode';

export default async function Tried<T>(
  cb: () => Promise<T | undefined>
): Promise<T> {
  const tried = 2;
  let error = new Error('알 수 없는 오류가 발생했습니다.');
  for (let i = 1; i <= tried; i++) {
    try {
      const res = await cb();
      if (res) return res;
    } catch (err) {
      error = err;
      logger.warn(
        `[Tried] Processing failure. ${error.message} (${i} of ${tried})`
      );
    }
  }

  logger.warn(`[Tried] Processing failure. ${error.message} (final)`);
  throw new InternalError(error.message, OPCODE.ERROR);
}

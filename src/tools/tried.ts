import { logger, RESULT } from '.';

export async function Tried<T>(cb: () => Promise<T | undefined>): Promise<T> {
  const tried = 2;
  let error = new Error('알 수 없는 오류가 발생했습니다.');
  for (let i = 1; i <= tried; i++) {
    try {
      const res = await cb();
      if (res) return res;
    } catch (err: any) {
      error = err;
      logger.warn(
        `[Tried] Processing failure. ${error.message} (${i} of ${tried})`
      );
    }
  }

  const { message } = error;
  logger.warn(`Tried / Processing failure. ${message} (final)`);
  throw RESULT.INVALID_ERROR({ details: { message } });
}

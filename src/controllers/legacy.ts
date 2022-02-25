import { KickboardClient } from 'kickboard-sdk';
import { KickboardDoc, KickboardMode } from '../models';
import { firestore, logger } from '../tools';

export class Legacy {
  private static kickCollection = firestore.collection('kick');

  public static async changeMode(
    kickboard: KickboardDoc,
    mode: KickboardMode
  ): Promise<void> {
    const { kickboardCode, kickboardId } = kickboard;
    const { ready, deploy } = this.getReadyAndDeploy(mode);
    if (process.env.NODE_ENV !== 'prod') {
      logger.info(
        `Legacy / ${kickboardCode} 킥보드의 상태가 변경되었지만 프로덕트가 아니람 무시합니다. ${KickboardMode[mode]}(can_ride: ${ready}, deploy: ${deploy})`
      );

      return;
    }

    logger.info(
      `Legacy / ${kickboardCode} 킥보드의 상태를 변경합니다. ${KickboardMode[mode]}(can_ride: ${ready}, deploy: ${deploy})`
    );

    await this.kickCollection
      .doc(kickboardId)
      .update({ can_ride: ready, deploy });
  }

  public static getReadyAndDeploy(mode: KickboardMode): {
    ready: boolean;
    deploy: boolean;
  } {
    if (mode === KickboardMode.READY) return { ready: true, deploy: true };
    if (mode === KickboardMode.INUSE) return { ready: false, deploy: true };
    return { ready: false, deploy: false };
  }
}

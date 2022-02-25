import { KickboardDoc, KickboardMode } from '../models';
import { firestore, logger } from '../tools';

export class Legacy {
  private static kickCollection = firestore.collection('kick');

  public static async changeMode(
    kickboard: KickboardDoc,
    mode: KickboardMode
  ): Promise<void> {
    const { kickboardCode, kickboardId } = kickboard;
    const { can_ride, deploy, problem } = this.getFirebaseUpdates(mode);
    if (process.env.NODE_ENV !== 'prod') {
      logger.info(
        `Legacy / ${kickboardCode} 킥보드의 상태가 변경되었지만 프로덕트가 아니람 무시합니다. ${KickboardMode[mode]}(can_ride: ${can_ride}, deploy: ${deploy}, problem: ${problem})`
      );

      return;
    }

    logger.info(
      `Legacy / ${kickboardCode} 킥보드의 상태를 변경합니다. ${KickboardMode[mode]}(can_ride: ${ready}, deploy: ${deploy})`
    );

    await this.kickCollection
      .doc(kickboardId)
      .update({ can_ride, deploy, problem });
  }

  public static getFirebaseUpdates(mode: KickboardMode): {
    can_ride: boolean;
    deploy: boolean;
    problem: boolean;
  } {
    if (mode === KickboardMode.READY) {
      return { can_ride: true, deploy: true, problem: false };
    } else if (mode === KickboardMode.INUSE) {
      return { can_ride: false, deploy: true, problem: false };
    } else if (mode === KickboardMode.BROKEN) {
      return { can_ride: false, deploy: false, problem: true };
    }

    return { can_ride: false, deploy: false, problem: false };
  }
}

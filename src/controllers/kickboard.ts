import { KickboardClient, KickboardService } from 'kickboard-sdk';
import {
  KickboardCollect,
  KickboardDoc,
  KickboardLost,
  KickboardMode,
  KickboardModel,
} from '../models';
import { InternalError, Joi, logger, OPCODE } from '../tools';
import Tried from '../tools/tried';

export default class Kickboard {
  public static kickboardService: KickboardService;

  public static async init(): Promise<void> {
    this.kickboardService = new KickboardService({
      hostname: String(process.env.HIKICK_KICKBOARD_SERVICE_HOSTNAME),
      username: String(process.env.HIKICK_KICKBOARD_SERVICE_USERNAME),
      password: String(process.env.HIKICK_KICKBOARD_SERVICE_PASSWORD),
      vhost: String(process.env.HIKICK_KICKBOARD_SERVICE_VHOST),
    });

    await this.kickboardService.connect();
    logger.info('[Kickboard] 킥보드 서비스와 연결되었습니다.');
  }

  public static async getKickboard(
    kickboardCode: string
  ): Promise<KickboardDoc | null> {
    const kickboard = await KickboardModel.findOne({ kickboardCode });
    return kickboard;
  }

  public static async getKickboardOrThrow(
    kickboardCode: string
  ): Promise<KickboardDoc> {
    const kickboard = await Kickboard.getKickboard(kickboardCode);
    if (!kickboard) {
      throw new InternalError(
        '해당 킥보드를 찾을 수 없습니다.',
        OPCODE.NOT_FOUND
      );
    }

    return kickboard;
  }

  public static async setKickboard(
    kickboardCode: string,
    props: {
      kickboardId: string;
      mode?: KickboardMode;
      lost?: KickboardLost;
      collect?: KickboardCollect;
    }
  ): Promise<Kickboard> {
    const schema = Joi.object({
      kickboardId: Joi.string().required(),
      mode: Joi.number().min(0).max(5).optional(),
      lost: Joi.number().min(0).max(3).allow(null).optional(),
      collect: Joi.number().min(0).max(3).allow(null).optional(),
    });

    const beforeKickboard = await Kickboard.getKickboard(kickboardCode);
    const { kickboardId, mode, lost, collect } = await schema.validateAsync(
      props
    );

    const where = { kickboardId };
    const data: any = {
      kickboardId,
      kickboardCode,
    };

    if (mode !== undefined) data.mode = mode;
    if (lost !== undefined) data.lost = lost;
    if (collect !== undefined) data.collect = collect;

    if (beforeKickboard) {
      await KickboardModel.updateOne(where, data);
    } else {
      await KickboardModel.create(data);
    }

    const kickboard = await Kickboard.getKickboard(kickboardCode);
    if (!kickboard) {
      throw new InternalError('킥보드를 등록 또는 수정할 수 없습니다.');
    }

    return kickboard;
  }

  public static async start(kickboardClient: KickboardClient): Promise<void> {
    await Tried(() => kickboardClient.start());
  }

  public static async stop(kickboardClient: KickboardClient): Promise<void> {
    await Tried(() => kickboardClient.stop());
  }

  public static async lock(kickboardClient: KickboardClient): Promise<void> {
    kickboardClient.lock();
  }

  public static async unlock(kickboardClient: KickboardClient): Promise<void> {
    kickboardClient.unlock();
  }

  public static async reboot(kickboardClient: KickboardClient): Promise<void> {
    kickboardClient.reboot();
  }
}

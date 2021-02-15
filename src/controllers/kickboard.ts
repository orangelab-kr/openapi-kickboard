import { InternalError, Joi, OPCODE, logger } from '../tools';
import {
  KickboardCollect,
  KickboardDoc,
  KickboardLost,
  KickboardMode,
  KickboardModel,
} from '../models';

import { KickboardService } from 'kickboard-sdk';

export default class Kickboard {
  public static kickboardService: KickboardService;

  public static async init(): Promise<void> {
    this.kickboardService = new KickboardService({
      hostname: String(process.env.KICKBOARD_SERVICE_HOSTNAME),
      username: String(process.env.KICKBOARD_SERVICE_USERNAME),
      password: String(process.env.KICKBOARD_SERVICE_PASSWORD),
      vhost: String(process.env.KICKBOARD_SERVICE_VHOST),
    });

    await this.kickboardService.connect();
    logger.info('[Kickboard] 킥보드 서비스와 연결되었습니다.');
  }

  public static async getKickboard(
    kickboardId: string
  ): Promise<KickboardDoc | null> {
    const kickboard = await KickboardModel.findOne({ kickboardId });
    return kickboard;
  }

  public static async getKickboardOrThrow(
    kickboardId: string
  ): Promise<KickboardDoc> {
    const kickboard = await Kickboard.getKickboard(kickboardId);
    if (!kickboard) {
      throw new InternalError(
        '해당 킥보드를 찾을 수 없습니다.',
        OPCODE.NOT_FOUND
      );
    }

    return kickboard;
  }

  public static async setKickboard(
    kickboardId: string,
    props: {
      kickboardCode: string;
      mode?: KickboardMode;
      lost?: KickboardLost;
      collect?: KickboardCollect;
    }
  ): Promise<Kickboard> {
    const schema = Joi.object({
      kickboardCode: Joi.string().length(6).required(),
      mode: Joi.number().min(0).max(5).optional(),
      lost: Joi.number().min(0).max(3).allow(null).optional(),
      collect: Joi.number().min(0).max(3).allow(null).optional(),
    });

    const beforeKickboard = await Kickboard.getKickboard(kickboardId);
    const { kickboardCode, mode, lost, collect } = await schema.validateAsync(
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

    const kickboard = await Kickboard.getKickboard(kickboardId);
    if (!kickboard) {
      throw new InternalError('킥보드를 등록 또는 수정할 수 없습니다.');
    }

    return kickboard;
  }
}

import { InternalError, Joi, OPCODE, logger } from '../tools';
import { KickboardClient, KickboardService } from 'kickboard-sdk';
import {
  KickboardCollect,
  KickboardDoc,
  KickboardLost,
  KickboardMode,
  KickboardModel,
} from '../models';
import {
  KickboardQueryKickboardCode,
  KickboardQueryLookupStatus,
  KickboardQueryMode,
  KickboardQueryRadiusLocation,
  KickboardQueryToShort,
} from '../queries/kickboard';

import Geo from '../tools/geometry';
import Tried from '../tools/tried';

export interface KickboardShort {
  kickboardCode: string;
  lost: number;
  status: {
    power: { scooter: { battery: number } };
    gps: {
      latitude: number;
      longitude: number;
    };
  };
}

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

  public static async getKickboardDocById(
    kickboardId: string
  ): Promise<KickboardDoc | null> {
    const kickboard = await KickboardModel.findOne({ kickboardId });
    return kickboard;
  }

  public static async getKickboard<T extends true | false>(
    kickboardCode: string,
    details: T
  ): Promise<T extends true ? Kickboard : KickboardShort> {
    const query: any = [
      ...KickboardQueryKickboardCode(kickboardCode),
      ...KickboardQueryLookupStatus(),
    ];

    if (!details) query.push(...KickboardQueryToShort());
    const kickboard = await KickboardModel.aggregate(query);
    if (kickboard.length <= 0) {
      throw new InternalError(
        '해당 킥보드를 찾을 수 없습니다.',
        OPCODE.NOT_FOUND
      );
    }

    return kickboard[0];
  }

  public static async getNearKickboards<T extends true | false>(
    props: {
      lat?: number;
      lng?: number;
      radius?: number;
      status?: KickboardMode[];
    },
    details: T
  ): Promise<{
    total: number;
    kickboards: (T extends true ? Kickboard : KickboardShort)[];
  }> {
    const schema = Joi.object({
      lat: Joi.number().min(-90).max(90).required(),
      lng: Joi.number().min(-180).max(180).required(),
      status: Joi.array().items(Joi.number().required()).optional(),
      radius: Joi.number().min(10).max(5000).default(1000).required(),
    });

    const query: any = [];
    const { lat, lng, radius, status } = await schema.validateAsync(props);
    const { low, high } = Geo.getRect({ lat, lng, radius });
    if (status) query.push(...KickboardQueryMode(...status));
    query.push(...KickboardQueryLookupStatus());
    query.push(...KickboardQueryRadiusLocation(low, high));
    if (!details) query.push(...KickboardQueryToShort());
    const kickboards = await KickboardModel.aggregate(query);
    const total = kickboards.length;

    return { total, kickboards };
  }

  public static async getKickboardDoc(
    kickboardCode: string
  ): Promise<KickboardDoc | null> {
    const kickboard = await KickboardModel.findOne({ kickboardCode });
    return kickboard;
  }

  public static async getKickboardDocOrThrow(
    kickboardCode: string
  ): Promise<KickboardDoc> {
    const kickboard = await Kickboard.getKickboardDoc(kickboardCode);
    if (!kickboard) {
      throw new InternalError(
        '해당 킥보드를 찾을 수 없습니다.',
        OPCODE.NOT_FOUND
      );
    }

    return kickboard;
  }

  public static async getKickboardDocs(props: {
    take?: number;
    skip?: number;
    search?: number;
  }): Promise<{ total: number; kickboards: KickboardDoc[] }> {
    const schema = Joi.object({
      take: Joi.number().default(10).optional(),
      skip: Joi.number().default(0).optional(),
      search: Joi.string().default('').allow('').optional(),
    });

    const { take, skip, search } = await schema.validateAsync(props);
    const $regex = new RegExp(search);
    const where = {
      $or: [{ kickboardId: { $regex } }, { kickboardCode: { $regex } }],
    };

    const [total, kickboards] = await Promise.all([
      KickboardModel.count(where),
      KickboardModel.find(where).limit(take).skip(skip),
    ]);

    return { total, kickboards };
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
    kickboardCode = kickboardCode.toUpperCase();
    const schema = Joi.object({
      kickboardId: Joi.string().required(),
      mode: Joi.number().min(0).max(5).optional(),
      lost: Joi.number().min(0).max(3).allow(null).optional(),
      collect: Joi.number().min(0).max(3).allow(null).optional(),
    });

    const obj = await schema.validateAsync(props);
    const { kickboardId, mode, lost, collect } = obj;
    const beforeKickboard = await Kickboard.getKickboardDoc(kickboardCode);
    if (
      kickboardId &&
      beforeKickboard &&
      kickboardId !== beforeKickboard.kickboardId
    ) {
      const hasKickboardId = await Kickboard.getKickboardDocById(kickboardId);
      if (hasKickboardId) {
        throw new InternalError(
          `${kickboardId} 킥보드는 이미 ${hasKickboardId.kickboardCode}가 사용하고 있습니다.`,
          OPCODE.ALREADY_EXISTS
        );
      }
    }

    const where = { kickboardCode };
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

    const kickboard = await Kickboard.getKickboardDoc(kickboardCode);
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

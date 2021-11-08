import dayjs from 'dayjs';
import { KickboardClient, KickboardService } from 'kickboard-sdk';
import { FranchisePermission, LocationPermission } from 'openapi-internal-sdk';
import { Status } from '.';
import {
  Geometry,
  getFranchise,
  getLocation,
  getRide,
  Helmet,
  Joi,
  KickboardCollect,
  KickboardDoc,
  KickboardLost,
  KickboardMode,
  KickboardModel,
  KickboardQueryKickboardCode,
  KickboardQueryKickboardFranchiseIds,
  KickboardQueryLookupStatus,
  KickboardQueryMode,
  KickboardQueryRadiusLocation,
  KickboardQueryToShort,
  logger,
  RESULT,
  StatusDoc,
  Tried,
} from '..';

export interface RideTimeline {
  latitude: number;
  longitude: number;
  battery: number;
  createdAt: Date;
}

export interface KickboardShort {
  kickboardCode: string;
  kickboardId: string;
  lost: number;
  status: {
    power: { scooter: { battery: number } };
    gps: {
      latitude: number;
      longitude: number;
    };
  };
}

export class Kickboard {
  public static kickboardService: KickboardService;

  public static async init(): Promise<void> {
    this.kickboardService = new KickboardService({
      hostname: String(process.env.HIKICK_KICKBOARD_SERVICE_HOSTNAME),
      username: String(process.env.HIKICK_KICKBOARD_SERVICE_USERNAME),
      password: String(process.env.HIKICK_KICKBOARD_SERVICE_PASSWORD),
      vhost: String(process.env.HIKICK_KICKBOARD_SERVICE_VHOST),
    });

    await this.kickboardService.connect();
    logger.info('Kickboard / 킥보드 서비스와 연결되었습니다.');
  }

  public static async removeKickboard(kickboardCode: string): Promise<void> {
    await KickboardModel.deleteOne({ kickboardCode });
  }

  public static async getKickboardDocById(
    kickboardId: string
  ): Promise<KickboardDoc | null> {
    const kickboard = await KickboardModel.findOne({ kickboardId });
    return kickboard;
  }

  public static async getLastRideTimeline<T extends true | false>(
    props: {
      kickboard: KickboardDoc;
      kickboardClient: KickboardClient;
    },
    details: T
  ): Promise<T extends true ? StatusDoc[] : RideTimeline[]> {
    const { kickboardClient, kickboard } = props;
    const { kickboardCode } = kickboard;
    const { terminatedAt } = await getRide()
      .instance.get('/rides', { params: { take: 2, kickboardCode } })
      .then(({ data }) => data.rides.find((ride: any) => ride.terminatedAt));

    const endedAt = new Date(terminatedAt);
    const startedAt = dayjs(terminatedAt).subtract(2, 'minutes').toDate();
    const timeline: any = await Status.getStatusBySpecificTime(
      kickboardClient,
      { startedAt, endedAt }
    );

    if (details) return timeline;
    return timeline.map(({ gps, power, createdAt }: any) => ({
      latitude: gps.latitude,
      longitude: gps.longitude,
      battery: power.scooter.battery,
      createdAt,
    }));
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
    if (kickboard.length <= 0) throw RESULT.CANNOT_FIND_KICKBOARD();
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
    const { low, high } = Geometry.getRect({ lat, lng, radius });
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
    if (!kickboard) throw RESULT.CANNOT_FIND_KICKBOARD();
    return kickboard;
  }

  public static async getKickboardByHelmetUnmount(props: {
    orderByField?: 'kickboardId' | 'kickboardCode' | 'createdAt' | 'updatedAt';
    orderBySort?: 'asc' | 'desc';
  }): Promise<{ total: number; kickboards: KickboardDoc[] }> {
    const schema = Joi.object({
      orderByField: Joi.string()
        .default('kickboardId')
        .valid('kickboardId', 'kickboardCode', 'createdAt', 'updatedAt')
        .optional(),
      orderBySort: Joi.string().default('desc').valid('asc', 'desc').optional(),
    });

    const { orderBySort, orderByField } = await schema.validateAsync(props);
    const sort = orderBySort === 'asc' ? 1 : -1;
    const query: any = [
      ...KickboardQueryLookupStatus(),
      { $match: { helmetId: null } },
      { $sort: { [orderByField]: sort } },
    ];

    const kickboards = await KickboardModel.aggregate(query);
    const total = kickboards.length;
    return { total, kickboards };
  }

  public static async getKickboardDocs(props: {
    take?: number;
    skip?: number;
    search?: number;
    orderByField?: 'kickboardId' | 'kickboardCode' | 'createdAt' | 'updatedAt';
    orderBySort?: 'asc' | 'desc';
  }): Promise<{ total: number; kickboards: KickboardDoc[] }> {
    const schema = Joi.object({
      take: Joi.number().default(10).optional(),
      skip: Joi.number().default(0).optional(),
      search: Joi.string().default('').allow('').optional(),
      orderByField: Joi.string()
        .default('kickboardId')
        .valid('kickboardId', 'kickboardCode', 'createdAt', 'updatedAt')
        .optional(),
      orderBySort: Joi.string().default('desc').valid('asc', 'desc').optional(),
    });

    const { take, skip, search, orderBySort, orderByField } =
      await schema.validateAsync(props);
    const $regex = new RegExp(search);
    const where = {
      $or: [{ kickboardId: { $regex } }, { kickboardCode: { $regex } }],
    };

    const sort = { [orderByField]: orderBySort };
    const [total, kickboards] = await Promise.all([
      KickboardModel.countDocuments(where),
      KickboardModel.find(where).limit(take).skip(skip).sort(sort),
    ]);

    return { total, kickboards };
  }

  public static async setKickboard(
    kickboardCode: string,
    props: {
      kickboardId?: string;
      franchiseId?: string;
      regionId?: string;
      mode?: KickboardMode;
      lost?: KickboardLost;
      collect?: KickboardCollect;
      photo?: string | null;
      maxSpeed?: number;
      helmetId?: string;
    }
  ): Promise<Kickboard> {
    kickboardCode = kickboardCode.toUpperCase();
    const schema = Joi.object({
      kickboardId: Joi.string().optional(),
      franchiseId: Joi.string().uuid().optional(),
      regionId: Joi.string().uuid().optional(),
      helmetId: Joi.string().allow(null).optional(),
      mode: Joi.number().min(0).max(5).optional(),
      lost: Joi.number().min(0).max(3).allow(null).optional(),
      collect: Joi.number().min(0).max(3).allow(null).optional(),
      photo: Joi.string().uri().allow(null).optional(),
      maxSpeed: Joi.number()
        .min(0)
        .max(50)
        .allow(null)
        .default(null)
        .optional(),
    });

    const obj = await schema.validateAsync(props);
    const {
      kickboardId,
      franchiseId,
      regionId,
      helmetId,
      mode,
      lost,
      collect,
      photo,
      maxSpeed,
    } = obj;
    const beforeKickboard = await Kickboard.getKickboardDoc(kickboardCode);
    if (helmetId) await Helmet.getHelmetOrThrow(helmetId);
    if (
      kickboardId &&
      beforeKickboard &&
      kickboardId !== beforeKickboard.kickboardId
    ) {
      const hasKickboardId = await Kickboard.getKickboardDocById(kickboardId);
      if (hasKickboardId) {
        throw RESULT.ALREADY_USING_KICKBOARD({
          args: [kickboardId, hasKickboardId.kickboardCode],
        });
      }
    }

    if (franchiseId) {
      await getFranchise([FranchisePermission.FRANCHISES_VIEW]).getFranchise(
        franchiseId
      );
    }

    if (regionId) {
      await getLocation([LocationPermission.REGIONS_VIEW]).getRegion(regionId);
    }

    const where = { kickboardCode };
    const data: any = { kickboardCode };
    if (kickboardId !== undefined) data.kickboardId = kickboardId;
    if (mode !== undefined) data.mode = mode;
    if (lost !== undefined) data.lost = lost;
    if (collect !== undefined) data.collect = collect;
    if (franchiseId !== undefined) data.franchiseId = franchiseId;
    if (regionId !== undefined) data.regionId = regionId;
    if (maxSpeed !== undefined) data.maxSpeed = maxSpeed;
    if (photo !== undefined) data.photo = photo;
    if (helmetId !== undefined) {
      await Helmet.disconnectAllHelmet(helmetId);
      data.helmetId = helmetId;
    }

    if (beforeKickboard) {
      await KickboardModel.updateOne(where, data);
    } else {
      if (!kickboardId || !franchiseId || !regionId) {
        throw RESULT.REQUIRED_KICKBOARD_DATA();
      }

      await KickboardModel.create(data);
    }

    const kickboard = await Kickboard.getKickboardDoc(kickboardCode);
    if (!kickboard) throw RESULT.CANNOT_SET_KICKBOARD();
    return kickboard;
  }

  public static async start(
    kickboard: KickboardDoc,
    kickboardClient: KickboardClient
  ): Promise<void> {
    await Tried(kickboardClient.start.bind(kickboardClient));
    await Kickboard.setKickboard(kickboard.kickboardCode, {
      mode: KickboardMode.INUSE,
    });
  }

  public static async stop(
    kickboard: KickboardDoc,
    kickboardClient: KickboardClient
  ): Promise<void> {
    await kickboardClient.lightOff();
    await Tried(kickboardClient.stop.bind(kickboardClient));
    await Kickboard.setKickboard(kickboard.kickboardCode, {
      mode: KickboardMode.READY,
    });
  }

  public static async lock(kickboardClient: KickboardClient): Promise<void> {
    await kickboardClient.stop();
  }

  public static async unlock(kickboardClient: KickboardClient): Promise<void> {
    await kickboardClient.start();
  }

  public static async reboot(kickboardClient: KickboardClient): Promise<void> {
    kickboardClient.reboot();
  }
}

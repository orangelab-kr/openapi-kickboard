import Joi from 'joi';
import { InternalError } from 'openapi-internal-sdk';
import {
  HelmetDoc,
  HelmetModel,
  HelmetStatus,
  KickboardModel,
  OPCODE,
} from '..';

export class Helmet {
  public static async createHelmet(props: {
    macAddress: string;
    version: number;
    password: string;
    encryptKey: number[];
    battery: number;
  }): Promise<HelmetDoc> {
    const schema = Joi.object({
      macAddress: Joi.string().length(12).alphanum().lowercase().required(),
      password: Joi.string().length(6).required(),
      version: Joi.number().min(0).max(1).required(),
      status: Joi.number().min(0).max(4).required(),
      encryptKey: Joi.string().base64().required(),
      battery: Joi.number().min(0).max(100).required(),
    });

    const { macAddress, version, battery, password, encryptKey } =
      await schema.validateAsync(props);

    const exists = await this.getHelmetByMac(macAddress);
    if (exists) {
      throw new InternalError(
        '이미 등록된 헬멧입니다.',
        OPCODE.ALREADY_EXISTS,
        { helmet: exists }
      );
    }

    const helmet = await HelmetModel.create({
      macAddress,
      version,
      battery,
      password,
      encryptKey,
    });

    return helmet;
  }

  public static async deleteHelmet(helmet: HelmetDoc): Promise<void> {
    const { _id } = helmet;
    const kickboard = await KickboardModel.findOne({ helmetId: _id });
    if (kickboard) {
      throw new InternalError('킥보드와 연결된 헬멧입니다.', OPCODE.ERROR, {
        kickboard,
      });
    }

    await HelmetModel.deleteOne({ _id });
  }

  public static async modifyHelmet(
    helmet: HelmetDoc,
    props: {
      macAddress: string;
      version: number;
      status: HelmetStatus;
      password: string;
      encryptKey: number[];
      battery: number;
    }
  ): Promise<HelmetDoc> {
    const schema = Joi.object({
      macAddress: Joi.string().length(12).alphanum().lowercase().optional(),
      version: Joi.number().min(0).max(1).optional(),
      password: Joi.string().length(6).optional(),
      status: Joi.number().min(0).max(4).optional(),
      encryptKey: Joi.string().base64().optional(),
      battery: Joi.number().min(0).max(100).optional(),
    });

    const { _id } = helmet;
    const { macAddress, version, status, battery, password, encryptKey } =
      await schema.validateAsync(props);

    const where = { _id };
    const data: any = {};
    if (macAddress !== undefined) data.macAddress = macAddress;
    if (version !== undefined) data.version = version;
    if (status !== undefined) data.status = status;
    if (battery !== undefined) data.battery = battery;
    if (password !== undefined) data.password = password;
    if (encryptKey !== undefined) data.encryptKey = encryptKey;
    await HelmetModel.updateOne(where, data);
    const updatedHelmet = await this.getHelmetOrThrow(_id);
    return updatedHelmet;
  }

  public static async getHelmetOrThrow(helmetId: string): Promise<HelmetDoc> {
    const helmet = await this.getHelmet(helmetId);
    if (!helmet) {
      throw new InternalError('헬멧을 찾을 수 없습니다.', OPCODE.NOT_FOUND);
    }

    return helmet;
  }

  public static async getHelmetByMacOrThrow(
    macAddress: string
  ): Promise<HelmetDoc> {
    const helmet = await this.getHelmetByMac(macAddress);
    if (!helmet) {
      throw new InternalError('헬멧을 찾을 수 없습니다.', OPCODE.NOT_FOUND);
    }

    return helmet;
  }

  public static async getHelmetByMac(
    macAddress: string
  ): Promise<HelmetDoc | null> {
    return HelmetModel.findOne({ macAddress });
  }

  public static async getHelmet(helmetId: string): Promise<HelmetDoc | null> {
    return HelmetModel.findById(helmetId);
  }

  public static async getHelmets(props: {
    take?: number;
    skip?: number;
    search?: number;
    orderByField?: 'helmetId' | 'battery' | 'createdAt' | 'updatedAt';
    orderBySort?: 'asc' | 'desc';
  }): Promise<{ total: number; helmets: HelmetDoc[] }> {
    const schema = Joi.object({
      take: Joi.number().default(10).optional(),
      skip: Joi.number().default(0).optional(),
      search: Joi.string().default('').allow('').optional(),
      orderByField: Joi.string()
        .default('helmetId')
        .valid('helmetId', 'battery', 'createdAt', 'updatedAt')
        .optional(),
      orderBySort: Joi.string().default('desc').valid('asc', 'desc').optional(),
    });

    const { take, skip, search, orderByField, orderBySort } =
      await schema.validateAsync(props);
    const $regex = new RegExp(search);
    const where = {
      $or: [{ helmetId: { $regex } }, { macAddress: { $regex } }],
    };

    const sort = { [orderByField]: orderBySort };
    const [total, helmets] = await Promise.all([
      HelmetModel.countDocuments(where),
      HelmetModel.find(where).limit(take).skip(skip).sort(sort),
    ]);

    return { total, helmets };
  }
}

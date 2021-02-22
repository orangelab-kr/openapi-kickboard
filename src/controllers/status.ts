import { StatusDoc, StatusModel } from '../models';

import { Joi } from '../tools';
import { KickboardClient } from 'kickboard-sdk';
import Tried from '../tools/tried';

export default class Status {
  public static async getStatus(
    kickboard: KickboardClient
  ): Promise<StatusDoc> {
    return Tried<StatusDoc>(async () => {
      const { kickboardId } = kickboard;
      const status = await StatusModel.findOne({ kickboardId })
        .select('-_id -__v')
        .sort({ createdAt: -1 });

      if (status) return status;
      await kickboard.getStatus();
    });
  }

  public static async refreshStatus(
    kickboard: KickboardClient
  ): Promise<StatusDoc> {
    await kickboard.getStatus();
    return Status.getStatus(kickboard);
  }

  public static async getStatusBySpecificTime(
    kickboard: KickboardClient,
    props: { startedAt?: Date; endedAt?: Date }
  ): Promise<StatusDoc[]> {
    const schema = Joi.object({
      startedAt: Joi.date().timestamp().required(),
      endedAt: Joi.date().timestamp().default(Date.now()).optional(),
    });

    const { kickboardId } = kickboard;
    const { startedAt, endedAt } = await schema.validateAsync(props);
    const status = await StatusModel.find({
      kickboardId,
      createdAt: { $gt: startedAt, $lt: endedAt },
    });

    return status;
  }
}

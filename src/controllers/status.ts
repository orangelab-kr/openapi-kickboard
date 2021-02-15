import { StatusDoc, StatusModel } from '../models';

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
}

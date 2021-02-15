import { InfoDoc, InfoModel } from '../models';

import { KickboardClient } from 'kickboard-sdk';
import Tried from '../tools/tried';

export default class Info {
  public static async getInfo(kickboard: KickboardClient): Promise<InfoDoc> {
    return Tried<InfoDoc>(async () => {
      const { kickboardId } = kickboard;
      const info = await InfoModel.findOne({ kickboardId }).select('-_id -__v');

      if (info) return info;
      await kickboard.getInfo();
    });
  }

  public static async refreshInfo(
    kickboard: KickboardClient
  ): Promise<InfoDoc> {
    await kickboard.getInfo();
    return Info.getInfo(kickboard);
  }
}

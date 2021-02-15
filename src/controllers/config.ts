import { ConfigDoc, ConfigModel } from '../models';

import { KickboardClient } from 'kickboard-sdk';
import Tried from '../tools/tried';

export default class Config {
  public static async getConfig(
    kickboard: KickboardClient
  ): Promise<ConfigDoc> {
    return Tried<ConfigDoc>(async () => {
      const { kickboardId } = kickboard;
      const config = await ConfigModel.findOne({ kickboardId }).select(
        '-_id -__v'
      );

      if (config) return config;
      await kickboard.getConfig();
    });
  }

  public static async refreshConfig(
    kickboard: KickboardClient
  ): Promise<Config> {
    await kickboard.getInfo();
    return Config.getConfig(kickboard);
  }
}

import { ConfigDoc, ConfigModel, Tried } from '..';

import { KickboardClient } from 'kickboard-sdk';

export class Config {
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
    await kickboard.getConfig();
    return Config.getConfig(kickboard);
  }
}

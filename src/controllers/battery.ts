import { BatteryDoc, BatteryModel } from '../models';

import { KickboardClient } from 'kickboard-sdk';
import Tried from '../tools/tried';

export default class Battery {
  public static async getBattery(
    kickboard: KickboardClient
  ): Promise<BatteryDoc> {
    return Tried<BatteryDoc>(async () => {
      const { kickboardId } = kickboard;
      const battery = await BatteryModel.findOne({ kickboardId }).select(
        '-_id -__v'
      );

      if (battery) return battery;
      await kickboard.getBattery();
    });
  }

  public static async refreshBattery(
    kickboard: KickboardClient
  ): Promise<Battery> {
    await kickboard.getBattery();
    return Battery.getBattery(kickboard);
  }
}

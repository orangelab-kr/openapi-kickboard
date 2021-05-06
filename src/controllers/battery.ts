import { BatteryDoc, BatteryModel, Tried } from '..';

import { KickboardClient } from 'kickboard-sdk';

export class Battery {
  public static async getBattery(
    kickboard: KickboardClient
  ): Promise<BatteryDoc> {
    return Tried<BatteryDoc>(async () => {
      const { kickboardId } = kickboard;
      const battery = await BatteryModel.findOne({ kickboardId }).select(
        '-_id -__v'
      );

      console.log(kickboardId);
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

  public static async batteryLock(
    kickboardClient: KickboardClient
  ): Promise<void> {
    kickboardClient.batteryLock();
  }

  public static async batteryUnlock(
    kickboardClient: KickboardClient
  ): Promise<void> {
    kickboardClient.batteryUnlock();
  }
}

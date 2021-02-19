import { KickboardClient } from 'kickboard-sdk';

export default class Bluetooth {
  public static async bluetoothOn(
    kickboardClient: KickboardClient
  ): Promise<void> {
    kickboardClient.bluetoothOn();
  }

  public static async bluetoothOff(
    kickboardClient: KickboardClient
  ): Promise<void> {
    kickboardClient.bluetoothOff();
  }
}
import { AlarmMode, KickboardClient } from 'kickboard-sdk';

import { Joi } from '..';

export class Alarm {
  public static async alarmOn(
    kickboardClient: KickboardClient,
    props: {
      mode?: AlarmMode;
      seconds?: number;
    }
  ): Promise<void> {
    const schema = Joi.object({
      mode: Joi.number().min(0).max(3).default(0).optional(),
      seconds: Joi.number().optional(),
    });

    const { mode, seconds } = await schema.validateAsync(props);
    kickboardClient.alarmOn(mode, seconds);
  }

  public static async alarmOff(
    kickboardClient: KickboardClient
  ): Promise<void> {
    kickboardClient.alarmOff();
  }
}

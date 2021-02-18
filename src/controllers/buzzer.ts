import { BuzzerMode, KickboardClient } from 'kickboard-sdk';

import { Joi } from '../tools';

export default class Buzzer {
  public static async buzzerOn(
    kickboardClient: KickboardClient,
    props: {
      mode?: BuzzerMode;
      seconds?: number;
    }
  ): Promise<void> {
    const schema = Joi.object({
      mode: Joi.number().min(0).max(3).default(0).optional(),
      seconds: Joi.number().optional(),
    });

    const { mode, seconds } = await schema.validateAsync(props);
    kickboardClient.buzzerOn(mode, seconds);
  }

  public static async buzzerOff(
    kickboardClient: KickboardClient
  ): Promise<void> {
    kickboardClient.buzzerOff();
  }
}

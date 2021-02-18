import { KickboardClient, LightMode } from 'kickboard-sdk';

import { Joi } from '../tools';

export default class Light {
  public static async lightOn(
    kickboardClient: KickboardClient,
    props: {
      mode?: LightMode;
      seconds?: number;
    }
  ): Promise<void> {
    const schema = Joi.object({
      mode: Joi.number().min(0).max(3).default(0).optional(),
      seconds: Joi.number().optional(),
    });

    const { mode, seconds } = await schema.validateAsync(props);
    kickboardClient.lightOn(mode, seconds);
  }

  public static async lightOff(
    kickboardClient: KickboardClient
  ): Promise<void> {
    kickboardClient.lightOff();
  }
}

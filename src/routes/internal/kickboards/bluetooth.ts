import { Router } from 'express';
import {
  Bluetooth,
  InternalPermissionMiddleware,
  PERMISSION,
  RESULT,
  Wrapper,
} from '../../..';

export function getInternalKickboardsBluetoothRouter(): Router {
  const router = Router();

  router.get(
    '/on',
    InternalPermissionMiddleware(PERMISSION.KICKBOARD_ACTION_BLUETOOTH_ON),
    Wrapper(async (req) => {
      const { kickboardClient } = req.internal;
      await Bluetooth.bluetoothOn(kickboardClient);
      throw RESULT.SUCCESS();
    })
  );

  router.get(
    '/off',
    InternalPermissionMiddleware(PERMISSION.KICKBOARD_ACTION_BLUETOOTH_OFF),
    Wrapper(async (req) => {
      const { kickboardClient } = req.internal;
      await Bluetooth.bluetoothOff(kickboardClient);
      throw RESULT.SUCCESS();
    })
  );

  return router;
}

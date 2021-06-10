import {
  Bluetooth,
  InternalPermissionMiddleware,
  OPCODE,
  PERMISSION,
  Wrapper,
} from '../../..';

import { Router } from 'express';
export function getInternalKickboardsBluetoothRouter(): Router {
  const router = Router();

  router.get(
    '/on',
    InternalPermissionMiddleware(PERMISSION.KICKBOARD_ACTION_BLUETOOTH_ON),
    Wrapper(async (req, res) => {
      const { kickboardClient } = req.internal;
      await Bluetooth.bluetoothOn(kickboardClient);
      res.json({ opcode: OPCODE.SUCCESS });
    })
  );

  router.get(
    '/off',
    InternalPermissionMiddleware(PERMISSION.KICKBOARD_ACTION_BLUETOOTH_OFF),
    Wrapper(async (req, res) => {
      const { kickboardClient } = req.internal;
      await Bluetooth.bluetoothOff(kickboardClient);
      res.json({ opcode: OPCODE.SUCCESS });
    })
  );

  return router;
}

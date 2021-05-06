import {
  Bluetooth,
  InternalPermissionMiddleware,
  OPCODE,
  PERMISSION,
  Wrapper,
} from '../..';

import { Router } from 'express';
export function getInternalBluetoothRouter(): Router {
  const router = Router();

  router.get(
    '/on',
    InternalPermissionMiddleware(PERMISSION.ACTION_BLUETOOTH_ON),
    Wrapper(async (req, res) => {
      const { kickboardClient } = req.internal;
      await Bluetooth.bluetoothOn(kickboardClient);
      res.json({ opcode: OPCODE.SUCCESS });
    })
  );

  router.get(
    '/off',
    InternalPermissionMiddleware(PERMISSION.ACTION_BLUETOOTH_OFF),
    Wrapper(async (req, res) => {
      const { kickboardClient } = req.internal;
      await Bluetooth.bluetoothOff(kickboardClient);
      res.json({ opcode: OPCODE.SUCCESS });
    })
  );

  return router;
}

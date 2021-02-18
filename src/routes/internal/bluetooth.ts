import InternalPermissionMiddleware, {
  PERMISSION,
} from '../../middlewares/internal/permissions';
import { OPCODE, Wrapper } from '../../tools';

import { Bluetooth } from '../../controllers';
import { Router } from 'express';

export default function getInternalBluetoothRouter(): Router {
  const router = Router();

  router.get(
    '/on',
    InternalPermissionMiddleware(PERMISSION.ACTION_BLUETOOTH_ON),
    Wrapper(async (req, res) => {
      await Bluetooth.bluetoothOn(req.kickboardClient);
      res.json({ opcode: OPCODE.SUCCESS });
    })
  );

  router.get(
    '/off',
    InternalPermissionMiddleware(PERMISSION.ACTION_BLUETOOTH_OFF),
    Wrapper(async (req, res) => {
      await Bluetooth.bluetoothOff(req.kickboardClient);
      res.json({ opcode: OPCODE.SUCCESS });
    })
  );

  return router;
}

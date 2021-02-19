import { Router } from 'express';
import { Bluetooth } from '../../controllers';
import InternalPermissionMiddleware, {
  PERMISSION,
} from '../../middlewares/internal/permissions';
import { OPCODE, Wrapper } from '../../tools';

export default function getInternalBluetoothRouter(): Router {
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

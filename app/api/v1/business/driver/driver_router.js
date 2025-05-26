import DriverController from './driver_controller.js';
import validation from './driver_validation.js';

import { ensureAuthorization, verifyKeycloackInternalToken } from '../../../../main/middleware.js';
import { validator } from '../../../../utils/validator.js';
import { Router } from 'express';

const driverController = new DriverController();

const router = Router();

router.post(
    '/search-user-vtex',
    ensureAuthorization,
    verifyKeycloackInternalToken,
    validator(validation.searchUserVtex),
    driverController.profile.bind(driverController)
);

export default router;

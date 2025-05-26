import ManagerController from './manager_controller.js';
import validation from './manager_validation.js';

import { Router } from 'express';
import { ensureAuthorization, verifyKeycloackInternalToken } from '../../../../main/middleware.js';
import { validator } from '../../../../utils/validator.js';

const managerController = new ManagerController();
const router = Router();

router.post(
    '/search-user-vtex',
    ensureAuthorization,
    verifyKeycloackInternalToken,
    validator(validation.validador),
    managerController.create.bind(managerController)
);

export default router;

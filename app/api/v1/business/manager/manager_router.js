import ManagerController from './manager_controller.js';
import DriverController from '../driver/driver_controller.js';
import FinancialStatementsController from '../financialStatements/financialStatements_controller.js';
import FreightController from '../freight/freight_controller.js';
import NotificationController from '../notification/notification_controller.js';
import PermissionController from '../permission/permission_controller.js';
import TruckController from '../truck/truck_controller.js';
import validation from './manager_validation.js';
import CreditController from '../credit/credit_controller.js';
import CartController from '../cart/cart_controller.js';
import multer from 'multer';
import middleware from '../../../../main/middleware.js';

import { validator } from '../../../../utils/validator.js';
import { Router } from 'express';
import { verifyIfUserHasRole } from '../../../../utils/auth.js';

const upload = multer();
const managerController = new ManagerController();
const driverController = new DriverController();
const financialStatementsController = new FinancialStatementsController();
const freightController = new FreightController();
const notificationController = new NotificationController();
const permissionController = new PermissionController();
const truckController = new TruckController();
const creditController = new CreditController();
const cartController = new CartController();

const router = Router();

router.post(
    '/signup',
    validator(validation.signup),
    managerController.signup.bind(managerController)
);
router.post(
    '/signin',
    validator(validation.signin),
    managerController.signin.bind(managerController)
);

router.post(
    '/driver/signup',
    validator(validation.signupDriver),
    driverController.create.bind(driverController)
);

router
    .put(
        '/user/:id',
        middleware.ensureAuthorization,
        middleware.verifyManagerToken,
        verifyIfUserHasRole('MASTER'),
        validator(validation.update),
        managerController.update.bind(managerController)
    )
    .get(
        '/user/:id',
        middleware.ensureAuthorization,
        middleware.verifyManagerToken,
        verifyIfUserHasRole('MASTER'),
        managerController.getId.bind(managerController)
    )
    .get(
        '/users',
        middleware.ensureAuthorization,
        middleware.verifyManagerToken,
        verifyIfUserHasRole('MASTER'),
        managerController.getAll.bind(managerController)
    )
    .delete(
        '/user/:id',
        middleware.ensureAuthorization,
        middleware.verifyManagerToken,
        verifyIfUserHasRole('MASTER'),
        managerController.delete.bind(managerController)
    );

router
    .put(
        '/driver/:id',
        middleware.ensureAuthorization,
        middleware.verifyManagerToken,
        driverController.update.bind(driverController)
    )
    .get(
        '/driver/:id',
        middleware.ensureAuthorization,
        middleware.verifyManagerToken,
        driverController.getId.bind(driverController)
    )
    .patch('/driver/reset-password/:cpf', driverController.resetPassword.bind(driverController))
    .get('/drivers', driverController.getAll.bind(driverController))
    .get('/drivers-select', driverController.getAllSelect.bind(driverController))
    .delete('/driver/:id', driverController.delete.bind(driverController));

router
    .post(
        '/financialStatement',
        financialStatementsController.create.bind(financialStatementsController)
    )
    .patch(
        '/financialStatement/:id',
        financialStatementsController.updateFinancial.bind(financialStatementsController)
    )
    .patch(
        '/financialStatement/finishing/:id',
        financialStatementsController.finishing.bind(financialStatementsController)
    )
    .get(
        '/financialStatement/:id',
        financialStatementsController.getId.bind(financialStatementsController)
    )
    .get(
        '/financialStatements',
        financialStatementsController.getAll.bind(financialStatementsController)
    )
    .delete(
        '/financialStatement/:id',
        financialStatementsController.delete.bind(financialStatementsController)
    );

router
    .post('/freight', freightController.create.bind(freightController))
    .patch(
        '/freight/:id',
        verifyIfUserHasRole('MASTER'),
        freightController.updateFreightManager.bind(freightController)
    )
    .get(
        '/first-check/:id',
        verifyIfUserHasRole('MASTER'),
        freightController.firstCheckId.bind(freightController)
    )
    .get('/freight/:id', freightController.getId.bind(freightController))
    .delete('/freight/:id', freightController.deleteFreightManager.bind(freightController));

router.get(
    '/notifications',
    verifyIfUserHasRole('MASTER'),
    notificationController.getAllUserNotifications.bind(notificationController)
);

router.put(
    '/notifications/:id',
    verifyIfUserHasRole('MASTER'),
    notificationController.updateRead.bind(notificationController)
);

router
    .post(
        '/user/credit',
        verifyIfUserHasRole('MASTER'),
        creditController.create.bind(creditController)
    )
    .get('/credits', verifyIfUserHasRole('MASTER'), creditController.getAll.bind(creditController))
    .get(
        '/credit/:id',
        verifyIfUserHasRole('MASTER'),
        creditController.getId.bind(creditController)
    )
    .delete(
        '/credit/:id',
        verifyIfUserHasRole('MASTER'),
        creditController.delete.bind(creditController)
    );

router
    .post('/truck', truckController.create.bind(truckController))
    .put('/truck/:id', truckController.update.bind(truckController))
    .get('/truck/:id', truckController.getId.bind(truckController))
    .get('/trucks', truckController.getAll.bind(truckController))
    .get('/trucks-select', truckController.getAllSelect.bind(truckController))
    .patch(
        '/truck/upload-image/:id',
        upload.single('file'),
        truckController.uploadImage.bind(truckController)
    )
    .delete('/truck/:id', truckController.delete.bind(truckController));

router
    .post('/cart', cartController.create.bind(cartController))
    .put('/cart/:id', cartController.update.bind(cartController))
    .get('/cart/:id', cartController.getId.bind(cartController))
    .get('/carts', cartController.getAll.bind(cartController))
    .get('/carts-select', cartController.getAllSelect.bind(cartController))
    .delete('/cart/:id', cartController.delete.bind(cartController));

router
    .post(
        '/permission',
        verifyIfUserHasRole('MASTER'),
        permissionController.createPermission.bind(permissionController)
    )
    .put(
        '/permission/:id',
        verifyIfUserHasRole('MASTER'),
        permissionController.updatePermission.bind(permissionController)
    )
    .get(
        '/permissions',
        verifyIfUserHasRole('MASTER'),
        permissionController.getAllPermission.bind(permissionController)
    );

router.put(
    '/add-role/:id',
    verifyIfUserHasRole('MASTER'),
    managerController.addRole.bind(managerController)
);

export default router;

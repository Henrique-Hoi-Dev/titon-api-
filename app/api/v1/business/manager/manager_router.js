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

router.post('/signup', validator(validation.signup), managerController.signup);
router.post('/signin', validator(validation.signin), managerController.signin);

router.post('/driver/signup', validator(validation.signupDriver), driverController.create);

router
    .put(
        '/user/:id',
        middleware.ensureAuthorization,
        middleware.verifyManagerToken,
        verifyIfUserHasRole('MASTER'),
        validator(validation.update),
        managerController.update
    )
    .get(
        '/user/:id',
        middleware.ensureAuthorization,
        middleware.verifyManagerToken,
        verifyIfUserHasRole('MASTER'),
        managerController.getId
    )
    .get(
        '/users',
        middleware.ensureAuthorization,
        middleware.verifyManagerToken,
        verifyIfUserHasRole('MASTER'),
        managerController.getAll
    )
    .delete(
        '/user/:id',
        middleware.ensureAuthorization,
        middleware.verifyManagerToken,
        verifyIfUserHasRole('MASTER'),
        managerController.delete
    );

router
    .put(
        '/driver/:id',
        middleware.ensureAuthorization,
        middleware.verifyManagerToken,
        driverController.update
    )
    .get(
        '/driver/:id',
        middleware.ensureAuthorization,
        middleware.verifyManagerToken,
        driverController.getId
    )
    .patch('/driver/reset-password/:cpf', driverController.resetPassword)
    .get('/drivers', driverController.getAll)
    .get('/drivers-select', driverController.getAllSelect)
    .delete('/driver/:id', driverController.delete);

router
    .post('/financialStatement', financialStatementsController.create)
    .patch('/financialStatement/:id', financialStatementsController.update)
    .patch('/financialStatement/finishing/:id', financialStatementsController.finishing)
    .get('/financialStatement/:id', financialStatementsController.getId)
    .get('/financialStatements', financialStatementsController.getAll)
    .delete('/financialStatement/:id', financialStatementsController.delete);

router
    .post('/freight', freightController.create)
    .patch('/freight/:id', verifyIfUserHasRole('MASTER'), freightController.update)
    .get('/first-check/:id', verifyIfUserHasRole('MASTER'), freightController.firstCheckId)
    .get('/freight/:id', freightController.getId)
    .delete('/freight/:id', freightController.delete);

router.get(
    '/notifications',
    verifyIfUserHasRole('MASTER'),
    notificationController.getAllUserNotifications
);

router.put('/notifications/:id', verifyIfUserHasRole('MASTER'), notificationController.updateRead);

router
    .post('/user/credit', verifyIfUserHasRole('MASTER'), creditController.create)
    .get('/credits', verifyIfUserHasRole('MASTER'), creditController.getAll)
    .get('/credit/:id', verifyIfUserHasRole('MASTER'), creditController.getId)
    .delete('/credit/:id', verifyIfUserHasRole('MASTER'), creditController.delete);

router
    .post('/truck', truckController.create)
    .put('/truck/:id', truckController.update)
    .get('/truck/:id', truckController.getId)
    .get('/trucks', truckController.getAll)
    .get('/trucks-select', truckController.getAllSelect)
    .patch('/truck/upload-image/:id', upload.single('file'), truckController.uploadImage)
    .delete('/truck/:id', truckController.delete);

router
    .post('/cart', cartController.create)
    .put('/cart/:id', cartController.update)
    .get('/cart/:id', cartController.getId)
    .get('/carts', cartController.getAll)
    .get('/carts-select', cartController.getAllSelect)
    .delete('/cart/:id', cartController.delete);

router
    .post('/permission', verifyIfUserHasRole('MASTER'), permissionController.createPermission)
    .put('/permission/:id', verifyIfUserHasRole('MASTER'), permissionController.updatePermission)
    .get('/permissions', verifyIfUserHasRole('MASTER'), permissionController.getAllPermission);

router.put('/add-role/:id', verifyIfUserHasRole('MASTER'), managerController.addRole);

export default router;

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

import { ensureAuthorization, verifyManagerToken } from '../../../../main/middleware.js';
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

router
    .put(
        '/user/:id',
        ensureAuthorization,
        verifyManagerToken,
        verifyIfUserHasRole('MASTER'),
        validator(validation.update),
        managerController.update
    )
    .get('/user/:id', ensureAuthorization, verifyManagerToken, verifyIfUserHasRole('MASTER'), managerController.getId)
    .get('/users', ensureAuthorization, verifyManagerToken, verifyIfUserHasRole('MASTER'), managerController.getAll)
    .delete(
        '/user/:id',
        ensureAuthorization,
        verifyManagerToken,
        verifyIfUserHasRole('MASTER'),
        managerController.delete
    );

router
    .put('/user/driver/:id', ensureAuthorization, verifyManagerToken, driverController.update)
    .get('/user/driver/:id', ensureAuthorization, verifyManagerToken, driverController.getId)
    .post('/driver/signup', driverController.create)
    .patch('/user/driver/reset-password/:cpf', driverController.resetPassword)
    .get('/drivers', driverController.getAll)
    .get('/drivers-select', driverController.getAllSelect)
    .delete('/user/driver/:id', driverController.delete);

router
    .post('/user/financialStatement', financialStatementsController.create)
    .patch('/user/financialStatement/:id', financialStatementsController.update)
    .patch('/user/financialStatement/finishing/:id', financialStatementsController.finishing)
    .get('/user/financialStatement/:id', financialStatementsController.getId)
    .get('/financialStatements', financialStatementsController.getAll)
    .delete('/user/financialStatement/:id', financialStatementsController.delete);

router
    .post('/user/freight', freightController.create)
    .patch('/user/freight/:id', verifyIfUserHasRole('MASTER'), freightController.update)
    .get('/user/first-check/:id', verifyIfUserHasRole('MASTER'), freightController.firstCheckId)
    .get('/user/freight/:id', freightController.getId)
    .delete('/user/freight/:id', freightController.delete);

router.get('/notifications', verifyIfUserHasRole('MASTER'), notificationController.getAllUserNotifications);

router.put('/notifications/:id', verifyIfUserHasRole('MASTER'), notificationController.updateRead);

router
    .post('/user/credit', verifyIfUserHasRole('MASTER'), creditController.create)
    .get('/credits', verifyIfUserHasRole('MASTER'), creditController.getAll)
    .get('/user/credit/:id', verifyIfUserHasRole('MASTER'), creditController.getId)
    .delete('/user/credit/:id', verifyIfUserHasRole('MASTER'), creditController.delete);

router
    .post('/user/truck', truckController.create)
    .put('/user/truck/:id', truckController.update)
    .get('/user/truck/:id', truckController.getId)
    .get('/trucks', truckController.getAll)
    .get('/trucks-select', truckController.getAllSelect)
    .patch('/truck/upload-image/:id', upload.single('file'), truckController.uploadImage)
    .delete('/user/truck/:id', truckController.delete);

router
    .post('/user/cart', cartController.create)
    .put('/user/cart/:id', cartController.update)
    .get('/user/cart/:id', cartController.getId)
    .get('/carts', cartController.getAll)
    .get('/carts-select', cartController.getAllSelect)
    .delete('/user/cart/:id', cartController.delete);

router
    .post('/user/permission', verifyIfUserHasRole('MASTER'), permissionController.createPermission)
    .put('/user/permission/:id', verifyIfUserHasRole('MASTER'), permissionController.updatePermission)
    .get('/permissions', verifyIfUserHasRole('MASTER'), permissionController.getAllPermission);

router.put('/user/add-role/:id', verifyIfUserHasRole('MASTER'), managerController.addRole);

export default router;

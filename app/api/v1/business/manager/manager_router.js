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

//Signup and Signin Manager
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

//Signup and Signin Driver
router.post(
    '/driver/signup',
    validator(validation.signupDriver),
    driverController.create.bind(driverController)
);

//User Manager
router
    .patch(
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
        validator(validation.getId),
        managerController.getId.bind(managerController)
    )
    .get(
        '/users',
        middleware.ensureAuthorization,
        middleware.verifyManagerToken,
        verifyIfUserHasRole('MASTER'),
        validator(validation.getAll),
        managerController.getAll.bind(managerController)
    )
    .delete(
        '/user/:id',
        middleware.ensureAuthorization,
        middleware.verifyManagerToken,
        verifyIfUserHasRole('MASTER'),
        validator(validation.delete),
        managerController.delete.bind(managerController)
    );

//Permission Manager
router
    .post(
        '/permission',
        middleware.ensureAuthorization,
        middleware.verifyManagerToken,
        verifyIfUserHasRole('MASTER'),
        validator(validation.createPermission),
        permissionController.createPermission.bind(permissionController)
    )
    .patch(
        '/permission/:role',
        middleware.ensureAuthorization,
        middleware.verifyManagerToken,
        verifyIfUserHasRole('MASTER'),
        validator(validation.updatePermission),
        permissionController.updatePermission.bind(permissionController)
    )
    .get(
        '/permissions',
        middleware.ensureAuthorization,
        middleware.verifyManagerToken,
        verifyIfUserHasRole('MASTER'),
        permissionController.getAllPermission.bind(permissionController)
    );

//Add Role Manager
router.patch(
    '/add-role/:id',
    middleware.ensureAuthorization,
    middleware.verifyManagerToken,
    verifyIfUserHasRole('MASTER'),
    validator(validation.addRole),
    managerController.addRole.bind(managerController)
);

//Driver Manager
router
    .patch(
        '/driver/:id',
        middleware.ensureAuthorization,
        middleware.verifyManagerToken,
        validator(validation.updateManagerDriver),
        driverController.updateManagerDriver.bind(driverController)
    )
    .get(
        '/driver/:id',
        middleware.ensureAuthorization,
        middleware.verifyManagerToken,
        driverController.getIdManagerDriver.bind(driverController)
    )
    .patch(
        '/driver/reset-password/:cpf',
        middleware.ensureAuthorization,
        middleware.verifyManagerToken,
        driverController.resetPassword.bind(driverController)
    )
    .get(
        '/drivers',
        middleware.ensureAuthorization,
        middleware.verifyManagerToken,
        validator(validation.getAllDrivers),
        driverController.getAllManagerDriver.bind(driverController)
    )
    .get(
        '/drivers-select',
        middleware.ensureAuthorization,
        middleware.verifyManagerToken,
        driverController.getAllSelect.bind(driverController)
    )
    .delete(
        '/driver/:id',
        middleware.ensureAuthorization,
        middleware.verifyManagerToken,
        driverController.deleteManagerDriver.bind(driverController)
    );

//Credit Manager
router
    .post(
        '/credit',
        middleware.ensureAuthorization,
        middleware.verifyManagerToken,
        verifyIfUserHasRole('MASTER'),
        validator(validation.create),
        creditController.create.bind(creditController)
    )
    .get(
        '/credits',
        middleware.ensureAuthorization,
        middleware.verifyManagerToken,
        verifyIfUserHasRole('MASTER'),
        validator(validation.getAllCredit),
        creditController.getAll.bind(creditController)
    )
    .get(
        '/credit/:id',
        middleware.ensureAuthorization,
        middleware.verifyManagerToken,
        verifyIfUserHasRole('MASTER'),
        validator(validation.getIdCredit),
        creditController.getId.bind(creditController)
    )
    .delete(
        '/credit/:id',
        middleware.ensureAuthorization,
        middleware.verifyManagerToken,
        verifyIfUserHasRole('MASTER'),
        validator(validation.deleteCredit),
        creditController.delete.bind(creditController)
    );

//Financial Statement Manager
router
    .post(
        '/financialStatement',
        middleware.ensureAuthorization,
        middleware.verifyManagerToken,
        validator(validation.createFinancialStatement),
        financialStatementsController.create.bind(financialStatementsController)
    )
    .patch(
        '/financialStatement/:id',
        middleware.ensureAuthorization,
        middleware.verifyManagerToken,
        validator(validation.updateFinancial),
        financialStatementsController.updateFinancial.bind(financialStatementsController)
    )
    .patch(
        '/financialStatement/finishing/:id',
        middleware.ensureAuthorization,
        middleware.verifyManagerToken,
        validator(validation.finishing),
        financialStatementsController.finishing.bind(financialStatementsController)
    )
    .get(
        '/financialStatement/:id',
        middleware.ensureAuthorization,
        middleware.verifyManagerToken,
        validator(validation.getIdFinancialStatement),
        financialStatementsController.getId.bind(financialStatementsController)
    )
    .get(
        '/financialStatements',
        middleware.ensureAuthorization,
        middleware.verifyManagerToken,
        validator(validation.getAllFinancialStatements),
        financialStatementsController.getAll.bind(financialStatementsController)
    )
    .delete(
        '/financialStatement/:id',
        middleware.ensureAuthorization,
        middleware.verifyManagerToken,
        verifyIfUserHasRole('MASTER'),
        validator(validation.deleteFinancialStatement),
        financialStatementsController.delete.bind(financialStatementsController)
    );

//Freight Manager
router
    .post(
        '/freight',
        middleware.ensureAuthorization,
        middleware.verifyManagerToken,
        validator(validation.createFreight),
        freightController.create.bind(freightController)
    )
    .patch(
        '/freight/approve/:id',
        middleware.ensureAuthorization,
        middleware.verifyManagerToken,
        verifyIfUserHasRole('MASTER'),
        validator(validation.approveFreight),
        freightController.approveFreightManager.bind(freightController)
    )
    .get(
        '/first-check/:id',
        middleware.ensureAuthorization,
        middleware.verifyManagerToken,
        validator(validation.firstCheckId),
        freightController.firstCheckId.bind(freightController)
    )
    .get(
        '/freight/:id',
        middleware.ensureAuthorization,
        middleware.verifyManagerToken,
        validator(validation.getIdManagerFreight),
        freightController.getIdManagerFreight.bind(freightController)
    )
    .delete(
        '/freight/:id',
        middleware.ensureAuthorization,
        middleware.verifyManagerToken,
        verifyIfUserHasRole('MASTER'),
        validator(validation.deleteFreight),
        freightController.deleteFreightManager.bind(freightController)
    );

//Notification Manager
router.get(
    '/notifications',
    middleware.ensureAuthorization,
    middleware.verifyManagerToken,
    verifyIfUserHasRole('MASTER'),
    notificationController.getAllUserNotifications.bind(notificationController)
);

router.put(
    '/notifications/:id/read',
    middleware.ensureAuthorization,
    middleware.verifyManagerToken,
    verifyIfUserHasRole('MASTER'),
    validator(validation.updateReadManager),
    notificationController.updateReadManager.bind(notificationController)
);

router.post(
    '/notification/create/:user_id',
    middleware.ensureAuthorization,
    middleware.verifyManagerToken,
    verifyIfUserHasRole('MASTER'),
    validator(validation.createNotification),
    notificationController.createNotification.bind(notificationController)
);

//Truck Manager
router
    .post(
        '/truck',
        middleware.ensureAuthorization,
        middleware.verifyManagerToken,
        validator(validation.createTruck),
        truckController.create.bind(truckController)
    )
    .patch(
        '/truck/:id',
        middleware.ensureAuthorization,
        middleware.verifyManagerToken,
        validator(validation.updateTruck),
        truckController.update.bind(truckController)
    )
    .get(
        '/truck/:id',
        middleware.ensureAuthorization,
        middleware.verifyManagerToken,
        verifyIfUserHasRole('MASTER'),
        validator(validation.getIdTruck),
        truckController.getId.bind(truckController)
    )
    .get(
        '/trucks',
        middleware.ensureAuthorization,
        middleware.verifyManagerToken,
        validator(validation.getAllTrucks),
        truckController.getAll.bind(truckController)
    )
    .get(
        '/trucks-select',
        middleware.ensureAuthorization,
        middleware.verifyManagerToken,
        truckController.getAllSelect.bind(truckController)
    )
    .patch(
        '/truck/upload-image/:id',
        middleware.ensureAuthorization,
        middleware.verifyManagerToken,
        upload.single('file'),
        validator(validation.uploadImageTruck),
        truckController.uploadImage.bind(truckController)
    )
    .delete(
        '/truck/:id',
        middleware.ensureAuthorization,
        middleware.verifyManagerToken,
        validator(validation.deleteTruck),
        truckController.delete.bind(truckController)
    );

//Cart Manager
router
    .post(
        '/cart',
        middleware.ensureAuthorization,
        middleware.verifyManagerToken,
        validator(validation.createCart),
        cartController.create.bind(cartController)
    )
    .put(
        '/cart/:id',
        middleware.ensureAuthorization,
        middleware.verifyManagerToken,
        validator(validation.updateCart),
        cartController.update.bind(cartController)
    )
    .get(
        '/cart/:id',
        middleware.ensureAuthorization,
        middleware.verifyManagerToken,
        validator(validation.getIdCart),
        cartController.getId.bind(cartController)
    )
    .get(
        '/carts',
        middleware.ensureAuthorization,
        middleware.verifyManagerToken,
        validator(validation.getAllCarts),
        cartController.getAll.bind(cartController)
    )
    .get(
        '/carts-select',
        middleware.ensureAuthorization,
        middleware.verifyManagerToken,
        cartController.getAllSelect.bind(cartController)
    )
    .delete(
        '/cart/:id',
        middleware.ensureAuthorization,
        middleware.verifyManagerToken,
        validator(validation.deleteCart),
        cartController.delete.bind(cartController)
    );

export default router;

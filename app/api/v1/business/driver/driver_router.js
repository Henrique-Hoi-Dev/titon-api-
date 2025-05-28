import DriverController from './driver_controller.js';
import validation from './driver_validation.js';
import CitiesController from '../cities/cities_controller.js';
import StatesController from '../states/states_controller.js';
import NotificationController from '../notification/notification_controller.js';
import FinancialStatementsController from '../financialStatements/financialStatements_controller.js';
import FreightController from '../freight/freight_controller.js';
import DepositMoneyController from '../depositMoney/depositMoney_controller.js';
import TravelExpensesController from '../travelExpenses/travelExpenses_controller.js';
import RestockController from '../restock/restock_controller.js';
import multer from 'multer';
import middleware from '../../../../main/middleware.js';

import { validator } from '../../../../utils/validator.js';
import { Router } from 'express';

const upload = multer();
const driverController = new DriverController();
const citiesController = new CitiesController();
const statesController = new StatesController();
const notificationController = new NotificationController();
const financialStatementsController = new FinancialStatementsController();
const freightController = new FreightController();
const depositMoneyController = new DepositMoneyController();
const travelExpensesController = new TravelExpensesController();
const restockController = new RestockController();

const router = Router();

//Signin
router.post(
    '/signin',
    validator(validation.signin),
    driverController.signin.bind(driverController)
);

//Code Request and Validation
router
    .post(
        '/code-request',
        validator(validation.requestCodeValidation),
        driverController.requestCodeValidation.bind(driverController)
    )
    .post(
        '/code-validation',
        validator(validation.validCodeForgotPassword),
        driverController.validCodeForgotPassword.bind(driverController)
    );

//Profile
router
    .get(
        '/profile',
        middleware.ensureAuthorization,
        middleware.verifyDriverToken,
        driverController.profile.bind(driverController)
    )
    .put(
        '/update-profile',
        middleware.ensureAuthorization,
        middleware.verifyDriverToken,
        validator(validation.update),
        driverController.update.bind(driverController)
    )
    .put(
        '/forgot-password',
        middleware.ensureAuthorization,
        middleware.verifyDriverToken,
        driverController.forgotPassword.bind(driverController)
    );

//Financial
router
    .patch(
        '/financial',
        middleware.ensureAuthorization,
        middleware.verifyDriverToken,
        financialStatementsController.updateDriver.bind(financialStatementsController)
    )
    .get(
        '/financial/current',
        middleware.ensureAuthorization,
        middleware.verifyDriverToken,
        financialStatementsController.getFinancialCurrent.bind(financialStatementsController)
    )
    .get(
        '/financial/finisheds',
        middleware.ensureAuthorization,
        middleware.verifyDriverToken,
        financialStatementsController.getAllFinished.bind(financialStatementsController)
    );

//Freight
router
    .post(
        '/freight',
        middleware.ensureAuthorization,
        middleware.verifyDriverToken,
        freightController.create.bind(freightController)
    )
    .patch(
        '/freight/:id',
        middleware.ensureAuthorization,
        middleware.verifyDriverToken,
        freightController.updateFreightDriver.bind(freightController)
    )
    .patch(
        '/freight/upload-documents/:id',
        upload.single('file'),
        middleware.ensureAuthorization,
        middleware.verifyDriverToken,
        freightController.uploadDocuments.bind(freightController)
    )
    .get(
        '/freight/search-documents',
        middleware.ensureAuthorization,
        middleware.verifyDriverToken,
        freightController.getDocuments.bind(freightController)
    )
    .patch(
        '/freight/delete-documents/:id',
        middleware.ensureAuthorization,
        middleware.verifyDriverToken,
        freightController.deleteFile.bind(freightController)
    )
    .get(
        '/freight/:id/:financialId',
        middleware.ensureAuthorization,
        middleware.verifyDriverToken,
        freightController.getId.bind(freightController)
    )
    .delete(
        '/freight/:id',
        middleware.ensureAuthorization,
        middleware.verifyDriverToken,
        freightController.deleteFreightDriver.bind(freightController)
    );

//Deposit
router
    .post(
        '/deposit',
        middleware.ensureAuthorization,
        middleware.verifyDriverToken,
        depositMoneyController.create.bind(depositMoneyController)
    )
    .get(
        '/deposit/:id',
        middleware.ensureAuthorization,
        middleware.verifyDriverToken,
        depositMoneyController.getId.bind(depositMoneyController)
    )
    .patch(
        '/deposit/upload-documents/:id',
        upload.single('file'),
        middleware.ensureAuthorization,
        middleware.verifyDriverToken,
        depositMoneyController.uploadDocuments.bind(depositMoneyController)
    )
    .delete(
        '/deposit/delete-documents/:id',
        middleware.ensureAuthorization,
        middleware.verifyDriverToken,
        depositMoneyController.deleteFile.bind(depositMoneyController)
    )
    .get(
        '/deposits',
        middleware.ensureAuthorization,
        middleware.verifyDriverToken,
        depositMoneyController.getAll.bind(depositMoneyController)
    );

//Travels
router
    .post(
        '/travel',
        middleware.ensureAuthorization,
        middleware.verifyDriverToken,
        travelExpensesController.create.bind(travelExpensesController)
    )
    .get(
        '/travel/:id',
        middleware.ensureAuthorization,
        middleware.verifyDriverToken,
        travelExpensesController.getId.bind(travelExpensesController)
    )
    .patch(
        '/travel/upload-documents/:id',
        upload.single('file'),
        middleware.ensureAuthorization,
        middleware.verifyDriverToken,
        travelExpensesController.uploadDocuments.bind(travelExpensesController)
    )
    .delete(
        '/travel/delete-documents/:id',
        middleware.ensureAuthorization,
        middleware.verifyDriverToken,
        travelExpensesController.deleteFile.bind(travelExpensesController)
    )
    .get(
        '/travels',
        middleware.ensureAuthorization,
        middleware.verifyDriverToken,
        travelExpensesController.getAll.bind(travelExpensesController)
    );

//Restock
router
    .post(
        '/restock',
        middleware.ensureAuthorization,
        middleware.verifyDriverToken,
        restockController.create.bind(restockController)
    )
    .get(
        '/restock/:id',
        middleware.ensureAuthorization,
        middleware.verifyDriverToken,
        restockController.getId.bind(restockController)
    )
    .patch(
        '/restock/upload-documents/:id',
        upload.single('file'),
        middleware.ensureAuthorization,
        middleware.verifyDriverToken,
        restockController.uploadDocuments.bind(restockController)
    )
    .delete(
        '/restock/delete-documents/:id',
        middleware.ensureAuthorization,
        middleware.verifyDriverToken,
        restockController.deleteFile.bind(restockController)
    )
    .get('/restocks', restockController.getAll.bind(restockController));

//Notifications
router.patch(
    '/activate/receive-notifications',
    middleware.ensureAuthorization,
    middleware.verifyDriverToken,
    notificationController.activateReceiveNotifications.bind(notificationController)
);
router.get(
    '/notifications',
    middleware.ensureAuthorization,
    middleware.verifyDriverToken,
    notificationController.getAll.bind(notificationController)
);
router.put(
    '/notifications/:id',
    middleware.ensureAuthorization,
    middleware.verifyDriverToken,
    notificationController.update.bind(notificationController)
);
router.post(
    '/notifications/allread',
    middleware.ensureAuthorization,
    middleware.verifyDriverToken,
    notificationController.markAllRead.bind(notificationController)
);

//Cities and States
router.get('/cities', citiesController.allCities.bind(citiesController));
router.get('/states', statesController.allStates.bind(statesController));
router.post(
    '/popular-city-state',
    upload.single('file'),
    middleware.ensureAuthorization,
    middleware.verifyDriverToken,
    statesController.popularCityStateData.bind(statesController)
);

export default router;

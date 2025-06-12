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

//Code Request and Validation Forgot Password
router
    .post(
        '/code-request-forgot-password',
        validator(validation.requestCodeValidationForgotPassword),
        driverController.requestCodeValidationForgotPassword.bind(driverController)
    )
    .post(
        '/code-validation-forgot-password',
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
    .get(
        '/avatar',
        middleware.ensureAuthorization,
        middleware.verifyDriverToken,
        driverController.getIdAvatar.bind(driverController)
    )
    .patch(
        '/avatar/upload-image',
        middleware.ensureAuthorization,
        middleware.verifyDriverToken,
        upload.single('file'),
        driverController.uploadImage.bind(driverController)
    )
    .put(
        '/forgot-password',
        middleware.ensureAuthorization,
        middleware.verifyDriverToken,
        driverController.forgotPassword.bind(driverController)
    );

//Financial
router
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
        validator(validation.getAllFinished),
        financialStatementsController.getAllFinished.bind(financialStatementsController)
    );

//Freight
router
    .post(
        '/freight',
        middleware.ensureAuthorization,
        middleware.verifyDriverToken,
        validator(validation.createFreight),
        freightController.createFreightDriver.bind(freightController)
    )
    .patch(
        '/freight/:id',
        middleware.ensureAuthorization,
        middleware.verifyDriverToken,
        validator(validation.updateFreight),
        freightController.updateFreightDriver.bind(freightController)
    )
    .patch(
        '/freight/upload-documents/:id',
        upload.single('file'),
        middleware.ensureAuthorization,
        middleware.verifyDriverToken,
        validator(validation.uploadDocuments),
        freightController.uploadDocuments.bind(freightController)
    )
    .patch(
        '/freight/delete-documents/:id',
        middleware.ensureAuthorization,
        middleware.verifyDriverToken,
        validator(validation.deleteFile),
        freightController.deleteFile.bind(freightController)
    )
    .get(
        '/freight/search-documents',
        middleware.ensureAuthorization,
        middleware.verifyDriverToken,
        validator(validation.getDocuments),
        freightController.getDocuments.bind(freightController)
    )
    .get(
        '/freight/:freightId/:financialId',
        middleware.ensureAuthorization,
        middleware.verifyDriverToken,
        validator(validation.getIdFreight),
        freightController.getId.bind(freightController)
    )
    .delete(
        '/freight/:id',
        middleware.ensureAuthorization,
        middleware.verifyDriverToken,
        validator(validation.deleteFreight),
        freightController.deleteFreightDriver.bind(freightController)
    );

//Deposit
router
    .post(
        '/deposit',
        middleware.ensureAuthorization,
        middleware.verifyDriverToken,
        validator(validation.createDeposit),
        depositMoneyController.create.bind(depositMoneyController)
    )
    .get(
        '/deposit/:id',
        middleware.ensureAuthorization,
        middleware.verifyDriverToken,
        validator(validation.getIdDeposit),
        depositMoneyController.getId.bind(depositMoneyController)
    )
    .patch(
        '/deposit/upload-documents/:id',
        upload.single('file'),
        middleware.ensureAuthorization,
        middleware.verifyDriverToken,
        validator(validation.uploadDocumentsDeposit),
        depositMoneyController.uploadDocuments.bind(depositMoneyController)
    )
    .delete(
        '/deposit/delete-documents/:id',
        middleware.ensureAuthorization,
        middleware.verifyDriverToken,
        validator(validation.deleteFileDeposit),
        depositMoneyController.deleteFile.bind(depositMoneyController)
    )
    .get(
        '/deposits',
        middleware.ensureAuthorization,
        middleware.verifyDriverToken,
        validator(validation.getAllDeposits),
        depositMoneyController.getAll.bind(depositMoneyController)
    );

//Travels
router
    .post(
        '/travel',
        middleware.ensureAuthorization,
        middleware.verifyDriverToken,
        validator(validation.createTravel),
        travelExpensesController.create.bind(travelExpensesController)
    )
    .get(
        '/travel/:id',
        middleware.ensureAuthorization,
        middleware.verifyDriverToken,
        validator(validation.getIdTravel),
        travelExpensesController.getId.bind(travelExpensesController)
    )
    .patch(
        '/travel/upload-documents/:id',
        upload.single('file'),
        middleware.ensureAuthorization,
        middleware.verifyDriverToken,
        validator(validation.uploadDocumentsTravel),
        travelExpensesController.uploadDocuments.bind(travelExpensesController)
    )
    .delete(
        '/travel/delete-documents/:id',
        middleware.ensureAuthorization,
        middleware.verifyDriverToken,
        validator(validation.deleteFileTravel),
        travelExpensesController.deleteFile.bind(travelExpensesController)
    )
    .get(
        '/travels',
        middleware.ensureAuthorization,
        middleware.verifyDriverToken,
        validator(validation.getAllTravels),
        travelExpensesController.getAll.bind(travelExpensesController)
    );

//Restock
router
    .post(
        '/restock',
        middleware.ensureAuthorization,
        middleware.verifyDriverToken,
        validator(validation.createRestock),
        restockController.create.bind(restockController)
    )
    .get(
        '/restock/:id',
        middleware.ensureAuthorization,
        middleware.verifyDriverToken,
        validator(validation.getIdRestock),
        restockController.getId.bind(restockController)
    )
    .patch(
        '/restock/upload-documents/:id',
        upload.single('file'),
        middleware.ensureAuthorization,
        middleware.verifyDriverToken,
        validator(validation.uploadDocumentsRestock),
        restockController.uploadDocuments.bind(restockController)
    )
    .delete(
        '/restock/delete-documents/:id',
        middleware.ensureAuthorization,
        middleware.verifyDriverToken,
        validator(validation.deleteFileRestock),
        restockController.deleteFile.bind(restockController)
    )
    .get(
        '/restocks',
        middleware.ensureAuthorization,
        middleware.verifyDriverToken,
        validator(validation.getAllRestocks),
        restockController.getAll.bind(restockController)
    );

//Notifications
router
    .patch(
        '/activate/push-receive-notifications',
        middleware.ensureAuthorization,
        middleware.verifyDriverToken,
        validator(validation.activatePushReceiveNotifications),
        notificationController.activatePushReceiveNotifications.bind(notificationController)
    )
    .get(
        '/notifications',
        middleware.ensureAuthorization,
        middleware.verifyDriverToken,
        validator(validation.getAllNotifications),
        notificationController.getAll.bind(notificationController)
    )
    .put(
        '/notifications/:id/read',
        middleware.ensureAuthorization,
        middleware.verifyDriverToken,
        validator(validation.updateReadNotification),
        notificationController.updateReadDriver.bind(notificationController)
    )
    .post(
        '/notifications/allread',
        middleware.ensureAuthorization,
        middleware.verifyDriverToken,
        notificationController.markAllRead.bind(notificationController)
    );

//Cities and States
router
    .get(
        '/cities',
        middleware.ensureAuthorization,
        middleware.verifyDriverToken,
        validator(validation.getAllCities),
        citiesController.allCities.bind(citiesController)
    )
    .get(
        '/states',
        middleware.ensureAuthorization,
        middleware.verifyDriverToken,
        validator(validation.getAllStates),
        statesController.allStates.bind(statesController)
    );

export default router;

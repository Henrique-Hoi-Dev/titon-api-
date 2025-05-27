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

import { ensureAuthorization, verifyDriverToken } from '../../../../main/middleware.js';
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

router
    .post('/signin', validator(validation.signin), driverController.signin)
    .post('/code-request', driverController.requestCodeValidation)
    .post('/code-validation', driverController.validCodeForgotPassword);

router
    .get('/driver/profile', driverController.profile)
    .put('/driver/update-profile', driverController.update)
    .put('/driver/forgot-password', driverController.forgotPassword);

router
    .patch('/driver/financial', ensureAuthorization, verifyDriverToken, financialStatementsController.update)
    .get(
        '/driver/financial/current',
        ensureAuthorization,
        verifyDriverToken,
        financialStatementsController.getFinancialCurrent
    )
    .get(
        '/driver/financial/finisheds',
        ensureAuthorization,
        verifyDriverToken,
        financialStatementsController.getAllFinished
    );

router
    .post('/driver/freight', ensureAuthorization, verifyDriverToken, freightController.create)
    .patch('/driver/freight/:id', ensureAuthorization, verifyDriverToken, freightController.update)
    .post('/driver/freight/starting-trip', ensureAuthorization, verifyDriverToken, freightController.startingTrip)
    .post('/driver/freight/finished-trip', ensureAuthorization, verifyDriverToken, freightController.finishedTrip)
    .patch(
        '/driver/freight/upload-documents/:id',
        upload.single('file'),

        freightController.uploadDocuments
    )
    .get('/driver/freight/search-documents', freightController.getDocuments)
    .patch('/driver/freight/delete-documents/:id', freightController.deleteFile)
    .get('/driver/freight/:id/:financialId', freightController.getId)
    .delete('/driver/freight/:id', freightController.deleteDriver);

router
    .post('/driver/deposit', depositMoneyController.create)
    .get('/driver/deposit/:id', depositMoneyController.getId)
    .patch(
        '/driver/deposit/upload-documents/:id',
        upload.single('file'),

        depositMoneyController.uploadDocuments
    )
    .delete('/driver/deposit/delete-documents/:id', depositMoneyController.deleteFile)
    .get('/driver/deposits', depositMoneyController.getAll);

router
    .post('/driver/travel', travelExpensesController.create)
    .get('/driver/travel/:id', travelExpensesController.getId)
    .patch(
        '/driver/travel/upload-documents/:id',
        upload.single('file'),

        travelExpensesController.uploadDocuments
    )
    .delete('/driver/travel/delete-documents/:id', travelExpensesController.deleteFile)
    .get('/driver/travels', travelExpensesController.getAll);

router
    .post('/driver/restock', restockController.create)
    .get('/driver/restock/:id', restockController.getId)
    .patch(
        '/driver/restock/upload-documents/:id',
        upload.single('file'),

        restockController.uploadDocuments
    )
    .delete('/driver/restock/delete-documents/:id', restockController.deleteFile)
    .get('/driver/restocks', restockController.getAll);

router.patch(
    '/driver/activate/receive-notifications',

    notificationController.activateReceiveNotifications
);

router.get('/driver/notifications', notificationController.getAll);
router.put('/driver/notifications/:id', notificationController.update);
router.post('/driver/notifications/allread', notificationController.markAllRead);

router.get('/cities', citiesController.allCities);
router.get('/states', statesController.allStates);
router.post('/popular-city-state', upload.single('file'), statesController.popularCityStateData);

export default router;

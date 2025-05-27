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

router.post('/signin', validator(validation.signin), driverController.signin);

router
    .post('/code-request', driverController.requestCodeValidation)
    .post('/code-validation', driverController.validCodeForgotPassword);

router
    .get(
        '/profile',
        middleware.ensureAuthorization,
        middleware.verifyDriverToken,
        driverController.profile
    )
    .put(
        '/update-profile',
        middleware.ensureAuthorization,
        middleware.verifyDriverToken,
        driverController.update
    )
    .put(
        '/forgot-password',
        middleware.ensureAuthorization,
        middleware.verifyDriverToken,
        driverController.forgotPassword
    );

router
    .patch(
        '/financial',
        middleware.ensureAuthorization,
        middleware.verifyDriverToken,
        financialStatementsController.update
    )
    .get(
        '/financial/current',
        middleware.ensureAuthorization,
        middleware.verifyDriverToken,
        financialStatementsController.getFinancialCurrent
    )
    .get(
        '/financial/finisheds',
        middleware.ensureAuthorization,
        middleware.verifyDriverToken,
        financialStatementsController.getAllFinished
    );

router
    .post(
        '/freight',
        middleware.ensureAuthorization,
        middleware.verifyDriverToken,
        freightController.create
    )
    .patch(
        '/freight/:id',
        middleware.ensureAuthorization,
        middleware.verifyDriverToken,
        freightController.update
    )
    .patch(
        '/freight/upload-documents/:id',
        upload.single('file'),

        freightController.uploadDocuments
    )
    .get('/freight/search-documents', freightController.getDocuments)
    .patch('/freight/delete-documents/:id', freightController.deleteFile)
    .get('/freight/:id/:financialId', freightController.getId)
    .delete('/freight/:id', freightController.deleteDriver);

router
    .post('/deposit', depositMoneyController.create)
    .get('/deposit/:id', depositMoneyController.getId)
    .patch(
        '/deposit/upload-documents/:id',
        upload.single('file'),

        depositMoneyController.uploadDocuments
    )
    .delete('/deposit/delete-documents/:id', depositMoneyController.deleteFile)
    .get('/deposits', depositMoneyController.getAll);

router
    .post('/travel', travelExpensesController.create)
    .get('/travel/:id', travelExpensesController.getId)
    .patch(
        '/travel/upload-documents/:id',
        upload.single('file'),

        travelExpensesController.uploadDocuments
    )
    .delete('/travel/delete-documents/:id', travelExpensesController.deleteFile)
    .get('/travels', travelExpensesController.getAll);

router
    .post('/restock', restockController.create)
    .get('/restock/:id', restockController.getId)
    .patch(
        '/restock/upload-documents/:id',
        upload.single('file'),

        restockController.uploadDocuments
    )
    .delete('/restock/delete-documents/:id', restockController.deleteFile)
    .get('/restocks', restockController.getAll);

router.patch(
    '/activate/receive-notifications',

    notificationController.activateReceiveNotifications
);

router.get('/notifications', notificationController.getAll);
router.put('/notifications/:id', notificationController.update);
router.post('/notifications/allread', notificationController.markAllRead);

router.get('/cities', citiesController.allCities);
router.get('/states', statesController.allStates);
router.post('/popular-city-state', upload.single('file'), statesController.popularCityStateData);

export default router;

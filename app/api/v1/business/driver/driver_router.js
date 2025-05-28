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
    .post('/code-request', driverController.requestCodeValidation.bind(driverController))
    .post('/code-validation', driverController.validCodeForgotPassword.bind(driverController));

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
        driverController.update.bind(driverController)
    )
    .put(
        '/forgot-password',
        middleware.ensureAuthorization,
        middleware.verifyDriverToken,
        driverController.forgotPassword.bind(driverController)
    );

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
        freightController.updateFreightDriver.bind(freightController)
    )
    .patch(
        '/freight/upload-documents/:id',
        upload.single('file'),

        freightController.uploadDocuments.bind(freightController)
    )
    .get('/freight/search-documents', freightController.getDocuments.bind(freightController))
    .patch('/freight/delete-documents/:id', freightController.deleteFile.bind(freightController))
    .get('/freight/:id/:financialId', freightController.getId.bind(freightController))
    .delete('/freight/:id', freightController.deleteFreightDriver.bind(freightController));

router
    .post('/deposit', depositMoneyController.create.bind(depositMoneyController))
    .get('/deposit/:id', depositMoneyController.getId.bind(depositMoneyController))
    .patch(
        '/deposit/upload-documents/:id',
        upload.single('file'),

        depositMoneyController.uploadDocuments.bind(depositMoneyController)
    )
    .delete(
        '/deposit/delete-documents/:id',
        depositMoneyController.deleteFile.bind(depositMoneyController)
    )
    .get('/deposits', depositMoneyController.getAll.bind(depositMoneyController));

router
    .post('/travel', travelExpensesController.create.bind(travelExpensesController))
    .get('/travel/:id', travelExpensesController.getId.bind(travelExpensesController))
    .patch(
        '/travel/upload-documents/:id',
        upload.single('file'),
        travelExpensesController.uploadDocuments.bind(travelExpensesController)
    )
    .delete(
        '/travel/delete-documents/:id',
        travelExpensesController.deleteFile.bind(travelExpensesController)
    )
    .get('/travels', travelExpensesController.getAll.bind(travelExpensesController));

router
    .post('/restock', restockController.create.bind(restockController))
    .get('/restock/:id', restockController.getId.bind(restockController))
    .patch(
        '/restock/upload-documents/:id',
        upload.single('file'),

        restockController.uploadDocuments.bind(restockController)
    )
    .delete('/restock/delete-documents/:id', restockController.deleteFile.bind(restockController))
    .get('/restocks', restockController.getAll.bind(restockController));

router.patch(
    '/activate/receive-notifications',

    notificationController.activateReceiveNotifications.bind(notificationController)
);

router.get('/notifications', notificationController.getAll.bind(notificationController));
router.put('/notifications/:id', notificationController.update.bind(notificationController));
router.post(
    '/notifications/allread',
    notificationController.markAllRead.bind(notificationController)
);

router.get('/cities', citiesController.allCities.bind(citiesController));
router.get('/states', statesController.allStates.bind(statesController));
router.post(
    '/popular-city-state',
    upload.single('file'),
    statesController.popularCityStateData.bind(statesController)
);

export default router;

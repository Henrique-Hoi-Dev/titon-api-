import managerRouter from '../api/v1/business/manager/manager_router.js';
import driverRouter from '../api/v1/business/driver/driver_router.js';

const addRouters = (router) => {
    router.route('/health').get((req, res) => {
        res.setHeader('csrf-token', req.csrfToken());
        return res.status(200).send();
    });

    router.use('/manager', managerRouter);
    router.use('/driver', driverRouter);

    return router;
};

export default addRouters;

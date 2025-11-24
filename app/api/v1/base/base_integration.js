import axios from 'axios';
import logger from '../../../utils/logger.js';
import '../../../../config/config.mjs';

const EXTERNAL_SERVICES = {
    oneSignal: process.env.ONESIGNAL_URL
};

class BaseIntegration {
    constructor(serviceName) {
        this.serviceName = serviceName;
        this.externalServices = EXTERNAL_SERVICES;
        this.logger = logger;

        this.httpClient = axios.create({
            baseURL: this.externalServices[this.serviceName]
        });

        this.httpClient.interceptors.response.use(
            function (response) {
                return response;
            },
            function (error) {
                logger.debug({ error });
                const err = new Error('INTEGRATION_ERROR');
                err.key = 'INTEGRATION_ERROR';
                err.status = error?.response?.status ?? 400;
                err.errors = error.response;

                err.response = error.response;
                err.config = error.config;

                return Promise.reject(err);
            }
        );
    }
}

export default BaseIntegration;

import Joi from 'joi';
import validateCpf from '../../../../utils/validateCpf.js';

export default {
    signup: {
        body: Joi.object({
            name: Joi.string().required(),
            email: Joi.string().email().required(),
            password: Joi.string().required().min(8),
            typeRole: Joi.string().required()
        })
    },
    signupDriver: {
        body: Joi.object({
            name: Joi.string().required(),
            cpf: Joi.string().replace(/\D/g, '').custom(validateCpf).required(),
            email: Joi.string().email().required(),
            phone: Joi.string().required(),
            password: Joi.string().required().min(8)
        })
    },
    signin: {
        body: Joi.object({
            email: Joi.string().email().required(),
            password: Joi.string().required()
        })
    },
    update: {
        body: Joi.object({
            name: Joi.string().required(),
            email: Joi.string().email().required()
        })
    },
    getId: {
        params: Joi.object({
            id: Joi.string().required()
        })
    },
    getAll: {
        query: Joi.object({
            page: Joi.number(),
            limit: Joi.number(),
            sort_order: Joi.string(),
            sort_field: Joi.string(),
            name: Joi.string(),
            id: Joi.string()
        })
    },
    delete: {
        params: Joi.object({
            id: Joi.string().required()
        })
    },
    createPermission: {
        body: Joi.object({
            role: Joi.string().required(),
            actions: Joi.array().items(Joi.string()).required()
        })
    },
    updatePermission: {
        body: Joi.object({
            actions: Joi.array().items(Joi.string()).required()
        })
    },
    updateManagerDriver: {
        params: Joi.object({
            id: Joi.string().required()
        }),
        body: Joi.object({
            name: Joi.string(),
            number_cnh: Joi.string(),
            valid_cnh: Joi.date(),
            date_valid_mopp: Joi.date(),
            date_valid_nr20: Joi.date(),
            date_valid_nr35: Joi.date(),
            date_admission: Joi.date(),
            date_birthday: Joi.date(),
            credit: Joi.number(),
            value_fix: Joi.number(),
            percentage: Joi.number(),
            daily: Joi.number()
        })
    },
    addRole: {
        params: Joi.object({
            id: Joi.string().required()
        }),
        body: Joi.object({
            role: Joi.string().required()
        })
    },
    getAllDrivers: {
        query: Joi.object({
            page: Joi.number(),
            limit: Joi.number(),
            sort_order: Joi.string(),
            sort_field: Joi.string(),
            search: Joi.string()
        })
    }
};

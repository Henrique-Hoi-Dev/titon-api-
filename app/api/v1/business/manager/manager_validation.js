import Joi from 'joi';
import validateCpf from '../../../../utils/validateCpf.js';
import { enumSchemas } from '../../../../utils/validations/enums.js';

export default {
    signup: {
        body: Joi.object({
            name: Joi.string().required(),
            email: Joi.string().email().required(),
            password: Joi.string().required().min(8),
            type_role: Joi.string(),
            phone: Joi.string(),
            cpf: Joi.string().replace(/\D/g, '').custom(validateCpf)
        })
    },
    signupDriver: {
        body: Joi.object({
            name: Joi.string().required(),
            cpf: Joi.string().replace(/\D/g, '').custom(validateCpf).required(),
            email: Joi.string().email(),
            phone: Joi.string().required(),
            password: Joi.string().required().min(8),
            daily: Joi.number().required(),
            value_fix: Joi.number(),
            percentage: Joi.number()
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
            name: Joi.string(),
            email: Joi.string().email(),
            password: Joi.string().min(6),
            type_role: enumSchemas.userRole,
            permission_id: Joi.number().integer()
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
    getIdUser: {
        params: Joi.object({
            id: Joi.string().required()
        })
    },
    uploadImageUser: {
        params: Joi.object({
            id: Joi.string().required()
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
            daily: Joi.number(),
            status: enumSchemas.driverStatus
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
    },
    getAllCredit: {
        query: Joi.object({
            driver_id: Joi.number().integer(),
            page: Joi.number(),
            limit: Joi.number(),
            sort_order: Joi.string(),
            sort_field: Joi.string()
        })
    },
    createCredit: {
        body: Joi.object({
            description: Joi.string(),
            driver_id: Joi.number().integer(),
            type_method: Joi.string().valid('CREDIT', 'DEBIT'),
            value: Joi.number()
        })
    },
    getIdCredit: {
        params: Joi.object({
            id: Joi.string().required()
        })
    },
    deleteCredit: {
        params: Joi.object({
            id: Joi.string().required()
        })
    },
    create: {
        body: Joi.object({
            name: Joi.string().required(),
            email: Joi.string().email().required(),
            password: Joi.string().min(6).required(),
            type_role: enumSchemas.userRole,
            permission_id: Joi.number().integer()
        })
    },
    getAllFinancialStatements: {
        query: Joi.object({
            page: Joi.number(),
            limit: Joi.number(),
            sort_order: Joi.string(),
            sort_field: Joi.string(),
            status_check: Joi.string(),
            status: Joi.string(),
            search: Joi.string()
        })
    },
    getIdFinancialStatement: {
        params: Joi.object({
            id: Joi.string().required()
        })
    },
    finishing: {
        params: Joi.object({
            id: Joi.string().required()
        }),
        body: Joi.object({
            final_km: Joi.number().required(),
            status: Joi.boolean().required()
        })
    },
    updateFinancial: {
        params: Joi.object({
            id: Joi.string().required()
        }),
        body: Joi.object({
            final_km: Joi.number().required(),
            status: Joi.boolean().required()
        })
    },
    createFinancialStatement: {
        body: Joi.object({
            driver_id: Joi.number().required(),
            truck_id: Joi.number().required(),
            cart_id: Joi.number().required(),
            start_date: Joi.date().required()
        })
    },
    deleteFinancialStatement: {
        params: Joi.object({
            id: Joi.string().required()
        })
    },
    createFreight: {
        body: Joi.object({
            driver_id: Joi.number(),
            truck_id: Joi.number(),
            cart_id: Joi.number(),
            start_date: Joi.date()
        })
    },
    approveFreight: {
        params: Joi.object({
            id: Joi.string().required()
        }),
        body: Joi.object({
            driver_id: Joi.number().required(),
            status: enumSchemas.freightStatus.required()
        })
    },
    firstCheckId: {
        params: Joi.object({
            id: Joi.string().required()
        })
    },
    getIdManagerFreight: {
        params: Joi.object({
            id: Joi.string().required()
        })
    },
    deleteFreight: {
        params: Joi.object({
            id: Joi.string().required()
        })
    },
    updateReadManager: {
        params: Joi.object({
            id: Joi.string().required()
        })
    },
    createNotification: {
        params: Joi.object({
            user_id: Joi.string().required()
        }),
        body: Joi.object({
            title: Joi.string().required(),
            message: Joi.string().required()
        })
    },
    createTruck: {
        body: Joi.object({
            truck_models: Joi.string(),
            truck_name_brand: Joi.string(),
            truck_board: Joi.string(),
            truck_color: Joi.string(),
            truck_km: Joi.number(),
            truck_chassis: Joi.string(),
            truck_year: Joi.number()
        })
    },
    updateTruck: {
        params: Joi.object({
            id: Joi.string().required()
        }),
        body: Joi.object({
            truck_models: Joi.string(),
            truck_name_brand: Joi.string(),
            truck_board: Joi.string(),
            truck_color: Joi.string(),
            truck_km: Joi.number(),
            truck_year: Joi.number(),
            truck_chassis: Joi.string()
        })
    },
    getAllTrucks: {
        query: Joi.object({
            page: Joi.number(),
            limit: Joi.number(),
            sort_order: Joi.string(),
            sort_field: Joi.string(),
            search: Joi.string()
        })
    },
    getIdTruck: {
        params: Joi.object({
            id: Joi.string().required()
        })
    },
    uploadImageTruck: {
        params: Joi.object({
            id: Joi.string().required()
        })
    },
    deleteTruck: {
        params: Joi.object({
            id: Joi.string().required()
        })
    },
    createCart: {
        body: Joi.object({
            cart_chassis: Joi.string(),
            cart_board: Joi.string(),
            cart_color: Joi.string(),
            cart_km: Joi.number(),
            cart_year: Joi.number(),
            cart_models: Joi.string(),
            cart_brand: Joi.string(),
            cart_tara: Joi.string(),
            cart_bodyworks: enumSchemas.cartBodyworks,
            cart_liter_capacity: Joi.number(),
            cart_ton_capacity: Joi.number()
        })
    },
    updateCart: {
        params: Joi.object({
            id: Joi.string().required()
        }),
        body: Joi.object({
            cart_chassis: Joi.string(),
            cart_board: Joi.string(),
            cart_color: Joi.string(),
            cart_km: Joi.number(),
            cart_year: Joi.number(),
            cart_models: Joi.string(),
            cart_brand: Joi.string(),
            cart_tara: Joi.string(),
            cart_bodyworks: enumSchemas.cartBodyworks,
            cart_liter_capacity: Joi.number(),
            cart_ton_capacity: Joi.number()
        })
    },
    getIdCart: {
        params: Joi.object({
            id: Joi.string().required()
        })
    },
    getAllCarts: {
        query: Joi.object({
            page: Joi.number(),
            limit: Joi.number(),
            sort_order: Joi.string(),
            sort_field: Joi.string(),
            search: Joi.string()
        })
    },
    changePassword: {
        body: Joi.object({
            oldPassword: Joi.string().required(),
            newPassword: Joi.string().min(6).required()
        })
    },
    deleteCart: {
        params: Joi.object({
            id: Joi.string().required()
        })
    },
    uploadImageCart: {
        params: Joi.object({
            id: Joi.string().required()
        })
    },
    getAllUserNotifications: {
        query: Joi.object({
            page: Joi.number(),
            limit: Joi.number()
        })
    }
};

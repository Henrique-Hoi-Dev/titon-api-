import Joi from 'joi';
import validateCpf from '../../../../utils/validateCpf.js';
import { enumSchemas } from '../../../../utils/validations/enums.js';

export default {
    signin: {
        body: Joi.object({
            cpf: Joi.string().replace(/\D/g, '').custom(validateCpf).required(),
            password: Joi.string().required()
        })
    },
    update: {
        body: Joi.object({
            name: Joi.string(),
            oldPassword: Joi.string(),
            password: Joi.string(),
            number_cnh: Joi.string(),
            valid_cnh: Joi.date(),
            date_valid_mopp: Joi.date(),
            date_valid_nr20: Joi.date(),
            date_valid_nr35: Joi.date(),
            date_admission: Joi.date(),
            date_birthday: Joi.date()
        })
    },
    getIdAvatar: {
        params: Joi.object({
            id: Joi.string().required()
        })
    },
    uploadImage: {
        params: Joi.object({
            id: Joi.string().required()
        })
    },
    requestCodeValidationForgotPassword: {
        body: Joi.object({
            phone: Joi.string().required(),
            cpf: Joi.string().replace(/\D/g, '').custom(validateCpf).required()
        })
    },
    validCodeForgotPassword: {
        body: Joi.object({
            code: Joi.string().required(),
            cpf: Joi.string().replace(/\D/g, '').custom(validateCpf).required()
        })
    },
    getIdFreight: {
        params: Joi.object({
            freight_id: Joi.number().required(),
            financial_id: Joi.number().required()
        })
    },
    getAllFinished: {
        query: Joi.object({
            search: Joi.string().optional(),
            page: Joi.number().optional(),
            limit: Joi.number().optional(),
            sort_order: Joi.string().optional(),
            sort_field: Joi.string().optional()
        })
    },
    createFreight: {
        body: Joi.object({
            start_freight_city: Joi.string(),
            end_freight_city: Joi.string(),
            truck_location: Joi.string(),
            contractor_name: Joi.string(),
            truck_current_km: Joi.number(),
            fuel_avg_per_km: Joi.number(),
            estimated_tonnage: Joi.number(),
            estimated_fuel_cost: Joi.number(),
            ton_value: Joi.number(),
            route_distance_km: Joi.string(),
            route_duration: Joi.string(),
            tons_loaded: Joi.number(),
            toll_cost: Joi.number(),
            truck_km_end_trip: Joi.number(),
            discharge: Joi.number(),
            status: enumSchemas.freightStatus
        })
    },
    uploadDocuments: {
        params: Joi.object({
            id: Joi.number().required()
        }),
        body: Joi.object({
            category: Joi.string().required(),
            typeImg: Joi.string().required()
        }).unknown(true)
    },
    updateFreight: {
        params: Joi.object({
            id: Joi.number().required()
        }),
        body: Joi.object({
            start_freight_city: Joi.string(),
            end_freight_city: Joi.string(),
            truck_location: Joi.string(),
            contractor_name: Joi.string(),
            truck_current_km: Joi.number(),
            fuel_avg_per_km: Joi.number(),
            estimated_tonnage: Joi.number(),
            estimated_fuel_cost: Joi.number(),
            ton_value: Joi.number(),
            route_distance_km: Joi.string(),
            route_duration: Joi.string(),
            tons_loaded: Joi.number(),
            toll_cost: Joi.number(),
            truck_km_end_trip: Joi.number(),
            discharge: Joi.number(),
            status: enumSchemas.freightStatus
        })
    },
    deleteFile: {
        params: Joi.object({
            id: Joi.number().required()
        }),
        query: Joi.object({
            typeImg: Joi.string(),
            category: Joi.string()
        })
    },
    startingTrip: {
        params: Joi.object({
            freight_id: Joi.number().required()
        }),
        body: Joi.object({
            truck_current_km: Joi.number()
        })
    },
    finishedTrip: {
        params: Joi.object({
            freight_id: Joi.number().required()
        }),
        body: Joi.object({
            truck_km_end_trip: Joi.number()
        })
    },
    getDocuments: {
        query: Joi.object({
            filename: Joi.string().required(),
            category: Joi.string().required()
        })
    },
    deleteFreight: {
        params: Joi.object({
            id: Joi.number().required()
        })
    },
    createDeposit: {
        body: Joi.object({
            value: Joi.number(),
            description: Joi.string(),
            freight_id: Joi.number(),
            local: Joi.string(),
            type_bank: Joi.string(),
            type_transaction: Joi.string(),
            payment: Joi.object({
                modo: Joi.string(),
                value: Joi.number(),
                parcels: Joi.number(),
                flag: Joi.string()
            }).optional()
        })
    },
    getIdDeposit: {
        params: Joi.object({
            id: Joi.number().required()
        })
    },
    uploadDocumentsDeposit: {
        params: Joi.object({
            id: Joi.number().required()
        }),
        body: Joi.object({
            category: Joi.string().required()
        }).unknown(true)
    },
    deleteFileDeposit: {
        params: Joi.object({
            id: Joi.number().required()
        })
    },
    getAllDeposits: {
        query: Joi.object({
            freight_id: Joi.number().optional(),
            page: Joi.number().optional(),
            limit: Joi.number().optional(),
            sort_order: Joi.string().optional(),
            sort_field: Joi.string().optional()
        })
    },
    createTravel: {
        body: Joi.object({
            freight_id: Joi.number(),
            city: Joi.string(),
            type_establishment: Joi.string(),
            name_establishment: Joi.string(),
            expense_description: Joi.string(),
            dfe: Joi.string(),
            value: Joi.number(),
            payment: Joi.object({
                modo: Joi.string(),
                value: Joi.number(),
                parcels: Joi.number(),
                flag: Joi.string()
            }).optional()
        })
    },
    getIdTravel: {
        params: Joi.object({
            id: Joi.number().required()
        })
    },
    uploadDocumentsTravel: {
        params: Joi.object({
            id: Joi.number().required()
        }),
        body: Joi.object({
            category: Joi.string().required()
        }).unknown(true)
    },
    deleteFileTravel: {
        params: Joi.object({
            id: Joi.number().required()
        })
    },
    getAllTravels: {
        query: Joi.object({
            freight_id: Joi.number().optional(),
            page: Joi.number().optional(),
            limit: Joi.number().optional(),
            sort_order: Joi.string().optional(),
            sort_field: Joi.string().optional()
        })
    },
    createRestock: {
        body: Joi.object({
            name_establishment: Joi.string(),
            city: Joi.string(),
            freight_id: Joi.number(),
            value_fuel: Joi.number(),
            liters_fuel: Joi.number(),
            total_nota_value: Joi.number()
        })
    },
    getIdRestock: {
        params: Joi.object({
            id: Joi.number().required()
        })
    },
    uploadDocumentsRestock: {
        params: Joi.object({
            id: Joi.number().required()
        }),
        body: Joi.object({
            category: Joi.string().required()
        }).unknown(true)
    },
    deleteFileRestock: {
        params: Joi.object({
            id: Joi.number().required()
        })
    },
    getAllRestocks: {
        query: Joi.object({
            freight_id: Joi.number().optional(),
            page: Joi.number().optional(),
            limit: Joi.number().optional(),
            sort_order: Joi.string().optional(),
            sort_field: Joi.string().optional()
        })
    },
    getAllCities: {
        query: Joi.object({
            search: Joi.string().optional(),
            uf: Joi.string().optional()
        })
    },
    getAllStates: {
        query: Joi.object({
            search: Joi.string().optional()
        })
    },
    popularCityStateData: {
        body: Joi.object({
            file: Joi.string().required()
        })
    },
    activatePushReceiveNotifications: {
        body: Joi.object({
            player_id: Joi.string().required(),
            external_user_id: Joi.string().required()
        })
    },
    getAllNotifications: {
        query: Joi.object({
            page: Joi.number().optional(),
            limit: Joi.number().optional(),
            sort_order: Joi.string().optional(),
            sort_field: Joi.string().optional()
        })
    },
    updateReadNotification: {
        params: Joi.object({
            id: Joi.number().required()
        })
    }
};

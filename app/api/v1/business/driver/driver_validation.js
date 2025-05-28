import Joi from 'joi';
import validateCpf from '../../../../utils/validateCpf.js';

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
    requestCodeValidation: {
        body: Joi.object({
            phone: Joi.string().required()
        })
    },
    validCodeForgotPassword: {
        body: Joi.object({
            code: Joi.string().required(),
            cpf: Joi.string().required()
        })
    }
};

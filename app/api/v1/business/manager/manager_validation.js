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
    }
};

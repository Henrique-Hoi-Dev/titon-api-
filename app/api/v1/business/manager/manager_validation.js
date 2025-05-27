import Joi from 'joi';

export default {
    signup: {
        body: Joi.object({
            name: Joi.string().required(),
            email: Joi.string().email().required(),
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

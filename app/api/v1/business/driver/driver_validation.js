import Joi from 'joi';

export default {
    signin: {
        body: Joi.object({
            cpf: Joi.string().required(),
            password: Joi.string().required()
        })
    }
};

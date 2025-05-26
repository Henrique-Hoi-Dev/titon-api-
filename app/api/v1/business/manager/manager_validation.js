import Joi from 'joi';

export default {
    validador: {
        body: Joi.object({
            params: Joi.string().required()
        })
    }
};

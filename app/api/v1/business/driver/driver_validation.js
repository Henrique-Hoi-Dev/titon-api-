import Joi from 'joi';
import validateCpf from '../../../../utils/validateCpf.js';

export default {
    signin: {
        body: Joi.object({
            cpf: Joi.string().replace(/\D/g, '').custom(validateCpf).required(),
            password: Joi.string().required()
        })
    }
};

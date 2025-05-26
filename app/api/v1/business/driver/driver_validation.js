import Joi from 'joi';

export default {
    searchUserVtex: {
        body: Joi.object({
            params: Joi.string()
        })
    }
};

import HttpStatus from 'http-status';

function verifyIfUserHasRole(role) {
    return function (req, res, next) {
        try {
            const user = req.manager;

            console.log('🚀 ~ user.type_role === role:', user);
            if (user.type_role === role) {
                next();
            } else {
                const error = new Error('PERMISSION_NOT_FOUND');
                error.status = 403;
                throw error;
            }
        } catch (err) {
            next(err);
        }
    };
}

export { verifyIfUserHasRole };

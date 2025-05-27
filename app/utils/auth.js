import HttpStatus from 'http-status';

function verifyIfUserHasRole(role) {
    return function (req, res, next) {
        try {
            const user = req.locals.user;

            if (user.type_role === role) {
                next();
            } else {
                return res.status(HttpStatus.FORBIDDEN).json({ error: 'INVALID_ROLE' });
            }
        } catch (err) {
            next(err);
        }
    };
}

export { verifyIfUserHasRole };

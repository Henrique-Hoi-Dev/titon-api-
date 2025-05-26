import pkg from 'lodash';
const { isEmpty } = pkg;
import logger from './logger.js';

function localsUserHasRole(user, roleArray) {
    if (!roleArray || !Array.isArray(roleArray) || roleArray.length < 1) {
        const err = Error('INVALID_ROLE');
        err.status = 401;
        throw err;
    }
    return user?.resource_access?.[process.env.KEYCLOAK_CLIENT_ID]?.roles?.some((element) =>
        roleArray.includes(element)
    );
}

function checkUserHasAccess(accessArray, user) {
    try {
        const result = !(
            isEmpty(user?.accessControl) ||
            !accessArray.some((access) => {
                const [feature, permission] = access.split(':');
                if (!feature || !permission) return false;
                return user?.accessControl?.[feature]?.[permission];
            })
        );
        return result;
    } catch (err) {
        logger.error(err);
        return false;
    }
}

export { localsUserHasRole, checkUserHasAccess };

import camelcaseKeys from 'camelcase-keys';

class BaseResourceController {
    constructor() {
        if (this.constructor === BaseResourceController) {
            throw new Error('Classe abstrata não pode ser instanciada');
        }
    }

    parseKeysToCamelcase(data) {
        return camelcaseKeys(data, { deep: true });
    }

    handleError(error) {
        if (error.status) {
            return error;
        }
        return {
            status: 500,
            message: error.message || 'Erro interno do servidor'
        };
    }
}

export default BaseResourceController;

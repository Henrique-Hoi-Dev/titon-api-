'use strict';

module.exports = {
    up: async (queryInterface) => {
        return queryInterface.bulkInsert('states', [
            { name: 'Acre', uf: 'AC', created_at: new Date(), updated_at: new Date() },
            { name: 'Alagoas', uf: 'AL', created_at: new Date(), updated_at: new Date() },
            { name: 'Amapá', uf: 'AP', created_at: new Date(), updated_at: new Date() },
            { name: 'Amazonas', uf: 'AM', created_at: new Date(), updated_at: new Date() },
            { name: 'Bahia', uf: 'BA', created_at: new Date(), updated_at: new Date() },
            { name: 'Ceará', uf: 'CE', created_at: new Date(), updated_at: new Date() },
            { name: 'Distrito Federal', uf: 'DF', created_at: new Date(), updated_at: new Date() },
            { name: 'Espírito Santo', uf: 'ES', created_at: new Date(), updated_at: new Date() },
            { name: 'Goiás', uf: 'GO', created_at: new Date(), updated_at: new Date() },
            { name: 'Maranhão', uf: 'MA', created_at: new Date(), updated_at: new Date() },
            { name: 'Mato Grosso', uf: 'MT', created_at: new Date(), updated_at: new Date() },
            {
                name: 'Mato Grosso do Sul',
                uf: 'MS',
                created_at: new Date(),
                updated_at: new Date()
            },
            { name: 'Minas Gerais', uf: 'MG', created_at: new Date(), updated_at: new Date() },
            { name: 'Pará', uf: 'PA', created_at: new Date(), updated_at: new Date() },
            { name: 'Paraíba', uf: 'PB', created_at: new Date(), updated_at: new Date() },
            { name: 'Paraná', uf: 'PR', created_at: new Date(), updated_at: new Date() },
            { name: 'Pernambuco', uf: 'PE', created_at: new Date(), updated_at: new Date() },
            { name: 'Piauí', uf: 'PI', created_at: new Date(), updated_at: new Date() },
            { name: 'Rio de Janeiro', uf: 'RJ', created_at: new Date(), updated_at: new Date() },
            {
                name: 'Rio Grande do Norte',
                uf: 'RN',
                created_at: new Date(),
                updated_at: new Date()
            },
            { name: 'Rio Grande do Sul', uf: 'RS', created_at: new Date(), updated_at: new Date() },
            { name: 'Rondônia', uf: 'RO', created_at: new Date(), updated_at: new Date() },
            { name: 'Roraima', uf: 'RR', created_at: new Date(), updated_at: new Date() },
            { name: 'Santa Catarina', uf: 'SC', created_at: new Date(), updated_at: new Date() },
            { name: 'São Paulo', uf: 'SP', created_at: new Date(), updated_at: new Date() },
            { name: 'Sergipe', uf: 'SE', created_at: new Date(), updated_at: new Date() },
            { name: 'Tocantins', uf: 'TO', created_at: new Date(), updated_at: new Date() }
        ]);
    },

    down: async (queryInterface) => {
        return queryInterface.bulkDelete('states', null, {});
    }
};

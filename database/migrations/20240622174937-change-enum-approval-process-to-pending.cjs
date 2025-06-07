'use strict';

module.exports = {
    async up(queryInterface) {
        // Primeiro, altera o enum para incluir o novo valor
        await queryInterface.sequelize.query(`
            ALTER TYPE enum_freights_status ADD VALUE IF NOT EXISTS 'APPROVAL_PROCESS';
        `);

        // Depois, atualiza os registros
        await queryInterface.bulkUpdate(
            'freights',
            { status: 'PENDING' },
            { status: 'APPROVAL_PROCESS' }
        );
    },

    async down(queryInterface) {
        // Primeiro, atualiza os registros de volta
        await queryInterface.bulkUpdate(
            'freights',
            { status: 'APPROVAL_PROCESS' },
            { status: 'PENDING' }
        );

        // Não podemos remover valores do enum, então apenas deixamos o valor existir
    }
};

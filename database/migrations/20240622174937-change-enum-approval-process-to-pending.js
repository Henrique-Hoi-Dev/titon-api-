'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.bulkUpdate('freights', { status: 'PENDING' }, { status: 'APPROVAL_PROCESS' });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkUpdate('freights', { status: 'APPROVAL_PROCESS' }, { status: 'PENDING' });
    },
};

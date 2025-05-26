'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Primeiro, verifique se o valor 'DRAFT' já existe no enum
        const result = await queryInterface.sequelize.query(
            "SELECT exists (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'enum_freights_status' AND e.enumlabel = 'DRAFT');"
        );
        const exists = result[0][0].exists;

        if (!exists) {
            await queryInterface.sequelize.query("ALTER TYPE enum_freights_status ADD VALUE 'DRAFT';");
        }
    },

    down: async (queryInterface, Sequelize) => {
        // Reversão pode ser complexa e depende do seu caso específico
    },
};

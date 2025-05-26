'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Renomear o enum antigo
        await queryInterface.sequelize.query(
            'ALTER TYPE "enum_carts_cart_bodyworks" RENAME TO "enum_carts_cart_bodyworks_old";'
        );

        // Criar o novo enum com valores atualizados
        await queryInterface.sequelize.query(
            "CREATE TYPE \"enum_carts_cart_bodyworks\" AS ENUM('TANK', 'BULKCARRIER', 'SIDER', 'CHEST', 'BUCKET');"
        );

        // Atualizar a coluna para usar o novo enum
        await queryInterface.sequelize.query(`
            ALTER TABLE "carts" 
            ALTER COLUMN "cart_bodyworks" 
            TYPE "enum_carts_cart_bodyworks" 
            USING "cart_bodyworks"::text::"enum_carts_cart_bodyworks"; 
        `);

        // Remover o enum antigo, garantindo que nenhuma coluna ainda o referencie
        await queryInterface.sequelize.query('DROP TYPE "enum_carts_cart_bodyworks_old";');
    },

    down: async (queryInterface, Sequelize) => {
        // Reverter para o enum antigo
        await queryInterface.sequelize.query(
            'ALTER TYPE "enum_carts_cart_bodyworks" RENAME TO "enum_carts_cart_bodyworks_new";'
        );
        await queryInterface.sequelize.query(
            "CREATE TYPE \"enum_carts_cart_bodyworks_old\" AS ENUM('tank', 'bulkCarrier', 'sider', 'chest', 'bucket');"
        );
        await queryInterface.sequelize.query(
            'ALTER TABLE "carts" ALTER COLUMN "cart_bodyworks" TYPE "enum_carts_cart_bodyworks_old" USING "cart_bodyworks"::text::"enum_carts_cart_bodyworks_old";'
        );
        await queryInterface.sequelize.query('DROP TYPE "enum_carts_cart_bodyworks_new";');
        await queryInterface.sequelize.query(
            'ALTER TYPE "enum_carts_cart_bodyworks_old" RENAME TO "enum_carts_cart_bodyworks";'
        );
    },
};

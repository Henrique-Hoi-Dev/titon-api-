module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('users', {
            id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            email: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true,
            },
            type_role: {
                type: Sequelize.ENUM,
                values: ['MASTER', 'USER', 'MANAGER', 'DIRECTOR', 'COLLABORATOR'],
                defaultValue: 'USER',
            },
            img_receipt: {
                type: Sequelize.JSONB,
                allowNull: true,
            },
            permission_id: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            password_hash: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            updated_at: {
                type: Sequelize.DATE,
                allowNull: false,
            },
        });
    },

    down: (queryInterface) => {
        return queryInterface.dropTable('users');
    },
};

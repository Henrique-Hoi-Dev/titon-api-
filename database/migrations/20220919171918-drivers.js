module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('drivers', {
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
            phone: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true,
            },
            email: {
                type: Sequelize.STRING,
                unique: true,
            },
            cpf: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true,
            },

            password_hash: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            number_cnh: {
                type: Sequelize.STRING,
            },
            valid_cnh: {
                type: Sequelize.DATE,
            },
            date_valid_mopp: {
                type: Sequelize.DATE,
            },
            date_valid_nr20: {
                type: Sequelize.DATE,
            },
            date_valid_nr35: {
                type: Sequelize.DATE,
            },
            date_admission: {
                type: Sequelize.DATE,
            },
            date_birthday: {
                type: Sequelize.DATE,
            },
            status: {
                type: Sequelize.ENUM,
                values: ['ACTIVE', 'INACTIVE', 'INCOMPLETE'],
                defaultValue: 'ACTIVE',
            },
            type_positions: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            permission_id: {
                type: Sequelize.INTEGER,
            },
            external_user_id: {
                type: Sequelize.STRING,
            },
            player_id: {
                type: Sequelize.STRING,
            },
            cart: {
                type: Sequelize.STRING,
            },
            truck: {
                type: Sequelize.STRING,
            },
            credit: {
                type: Sequelize.INTEGER,
                defaultValue: 0,
            },
            credit: Sequelize.INTEGER,
            transactions: {
                type: Sequelize.ARRAY({
                    type: Sequelize.JSONB,
                    defaultValue: {
                        typeTransactions: Sequelize.STRING,
                        value: Sequelize.INTEGER,
                    },
                }),
                defaultValue: [],
            },
            value_fix: {
                type: Sequelize.INTEGER,
                defaultValue: 0,
            },
            percentage: {
                type: Sequelize.INTEGER,
                defaultValue: 0,
            },
            daily: {
                type: Sequelize.INTEGER,
                defaultValue: 0,
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
        return queryInterface.dropTable('drivers');
    },
};

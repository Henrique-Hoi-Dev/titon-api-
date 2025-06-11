module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Primeiro, cria o enum
        await queryInterface.sequelize.query(`
            DO $$ BEGIN
                CREATE TYPE "public"."enum_Drivers_status" AS ENUM('ACTIVE', 'INACTIVE', 'INCOMPLETE');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `);

        // Depois, cria a tabela
        return queryInterface.createTable('drivers', {
            id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                autoIncrement: true,
                primaryKey: true
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false
            },
            phone: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true
            },
            email: {
                type: Sequelize.STRING,
                unique: true,
                allowNull: false
            },
            cpf: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true
            },
            gender: {
                type: Sequelize.STRING
            },
            birth_date: {
                type: Sequelize.DATE
            },
            avatar: {
                type: Sequelize.JSONB,
                allowNull: true,
                defaultValue: {}
            },
            password_hash: {
                type: Sequelize.STRING,
                allowNull: false
            },
            number_cnh: {
                type: Sequelize.STRING
            },
            valid_cnh: {
                type: Sequelize.DATE
            },
            date_valid_mopp: {
                type: Sequelize.DATE
            },
            date_valid_nr20: {
                type: Sequelize.DATE
            },
            date_valid_nr35: {
                type: Sequelize.DATE
            },
            date_admission: {
                type: Sequelize.DATE
            },
            date_birthday: {
                type: Sequelize.DATE
            },
            status: {
                type: Sequelize.ENUM('ACTIVE', 'INACTIVE', 'INCOMPLETE'),
                defaultValue: 'INCOMPLETE'
            },
            type_positions: {
                type: Sequelize.STRING,
                defaultValue: 'COLLABORATOR'
            },
            permission_id: {
                type: Sequelize.INTEGER
            },
            external_user_id: {
                type: Sequelize.STRING
            },
            player_id: {
                type: Sequelize.STRING
            },
            credit: {
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            transactions: {
                type: Sequelize.JSONB,
                defaultValue: []
            },
            value_fix: {
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            percentage: {
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            daily: {
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            address: {
                type: Sequelize.JSONB,
                defaultValue: {
                    street: '',
                    number: '',
                    complement: '',
                    state: '',
                    city: ''
                }
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false
            },
            updated_at: {
                type: Sequelize.DATE,
                allowNull: false
            }
        });
    },

    down: async (queryInterface) => {
        await queryInterface.dropTable('drivers');
        // Não podemos remover o enum, então apenas deixamos ele existir
    }
};

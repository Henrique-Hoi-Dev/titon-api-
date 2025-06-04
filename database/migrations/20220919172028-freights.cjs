module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('freights', {
            id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                autoIncrement: true,
                primaryKey: true
            },
            financial_statements_id: {
                type: Sequelize.INTEGER,
                references: { model: 'financial_statements', key: 'id' },
                allowNull: true,
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            start_freight_city: {
                type: Sequelize.STRING
            },
            final_freight_city: {
                type: Sequelize.STRING
            },
            location_of_the_truck: {
                type: Sequelize.STRING
            },
            contractor: {
                type: Sequelize.STRING
            },
            truck_current_km: {
                type: Sequelize.INTEGER
            },
            liter_of_fuel_per_km: {
                type: Sequelize.INTEGER
            },
            preview_tonne: {
                type: Sequelize.INTEGER
            },
            value_tonne: {
                type: Sequelize.INTEGER
            },
            preview_value_diesel: {
                type: Sequelize.INTEGER
            },
            status: {
                type: Sequelize.ENUM,
                values: ['PENDING', 'APPROVED', 'STARTING_TRIP', 'DENIED', 'FINISHED']
            },
            distance: {
                type: Sequelize.STRING
            },
            duration: {
                type: Sequelize.STRING
            },

            // level two
            tons_loaded: {
                type: Sequelize.INTEGER
            },
            toll_value: {
                type: Sequelize.INTEGER
            },
            truck_km_completed_trip: {
                type: Sequelize.INTEGER
            },
            discharge: {
                type: Sequelize.INTEGER
            },
            img_proof_cte: {
                type: Sequelize.JSONB,
                allowNull: true
            },
            img_proof_ticket: {
                type: Sequelize.JSONB,
                allowNull: true
            },
            img_proof_freight_letter: {
                type: Sequelize.JSONB,
                allowNull: true
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

    down: (queryInterface) => {
        return queryInterface.dropTable('freights');
    }
};

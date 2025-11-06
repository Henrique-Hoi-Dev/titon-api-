import Sequelize, { Model } from 'sequelize';

class Truck extends Model {
    static init(sequelize) {
        super.init(
            {
                truck_models: Sequelize.STRING,
                truck_name_brand: Sequelize.STRING,
                truck_board: Sequelize.STRING,
                truck_color: Sequelize.STRING,
                truck_km: Sequelize.DOUBLE,
                truck_chassis: Sequelize.STRING,
                truck_year: Sequelize.STRING,
                image_truck: {
                    type: Sequelize.JSONB,
                    allowNull: true,
                    defaultValue: {}
                }
            },
            {
                sequelize,
                timestamps: true
            }
        );
        return this;
    }

    static associate(models) {
        this.hasMany(models.FinancialStatements, {
            foreignKey: 'truck_id',
            as: 'financialStatements'
        });
    }
}

export default Truck;

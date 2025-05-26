import Sequelize, { Model } from 'sequelize';

class DataDriver extends Model {
    static init(sequelize) {
        super.init(
            {
                driver_name: Sequelize.STRING,
                truck_models: Sequelize.STRING,
                cart_models: Sequelize.STRING,
                credit: Sequelize.DOUBLE
            },
            {
                sequelize,
                timestamps: true
            }
        );
        return this;
    }

    // static associate(models) {
    //   this.hasMany(models.FinancialStatements, { foreignKey: 'data_driver_id', as: 'financialStatements' });
    // }
}

export default DataDriver;

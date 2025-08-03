import BaseService from '../../base/base_service.js';
import CitiesModel from './cities_model.js';
import StatesModel from '../states/states_model.js';
import { Op, literal } from 'sequelize';

class CitiesService extends BaseService {
    constructor() {
        super();
        this._citiesModel = CitiesModel;
        this._statesModel = StatesModel;
    }

    async allCities({ search = '', uf = '' }) {
        const cities = await this._citiesModel.findAll({
            where: {
                [Op.or]: [{ name: { [Op.iLike]: `%${search}%` } }]
            },
            attributes: ['id', 'name'],
            include: [
                {
                    model: this._statesModel,
                    as: 'states',
                    attributes: ['uf'],
                    where: uf ? { uf: { [Op.iLike]: `%${uf}%` } } : {}
                }
            ],
            order: [
                [
                    literal(`CASE 
                WHEN "Cities"."name" ILIKE '${search}%' THEN 1 
                ELSE 2 
            END`),
                    'ASC'
                ],
                ['name', 'ASC']
            ]
        });

        return cities.map((city) => city.toJSON());
    }
}

export default CitiesService;

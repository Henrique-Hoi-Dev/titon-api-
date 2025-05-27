import { Op } from 'sequelize';
import StatesModel from './states_model.js';
import XLSX from 'xlsx';
import BaseService from '../../base/base_service.js';

class StatesService extends BaseService {
    constructor() {
        super();
        this._statesModel = StatesModel;
    }

    async allStates({ search = '' }) {
        const states = await this._statesModel.findAll({
            where: {
                [Op.or]: [
                    { name: { [Op.iLike]: `%${search}%` } },
                    { uf: { [Op.iLike]: `%${search}%` } }
                ]
            },
            attributes: ['id', 'name', 'uf']
        });
        return states;
    }

    async popularCityStateData(props) {
        const { file } = props;

        if (file === undefined) throw new Error('FILE_NOT_FOUND_ERROR');

        const workbook = XLSX.read(file.buffer, {
            type: 'buffer',
            cellDates: true,
            cellText: true
        });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: true });

        // const cities = jsonData.map((row) => {
        //   return `{ name: "${row.name}", states_id: statesMap['${row.stateUf}'] }`;
        // });

        // // Formatando o resultado final como um array JS
        // const output = `const cities = [\n  ${cities.join(
        //   ',\n  '
        // )}\n];\n\nmodule.exports = cities;`;

        // // Salvando o arquivo gerado
        // fs.writeFileSync(path.join(__dirname, 'citiesArray.js'), output);

        return jsonData;
    }

    _handleMongoError(error) {
        const keys = Object.keys(error.errors);
        const err = new Error(error.errors[keys[0]].message);
        err.field = keys[0];
        err.status = 409;
        throw err;
    }
}

export default StatesService;

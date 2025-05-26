import https from 'https';
import dotenv from 'dotenv';

dotenv.config();

export default {
    async getRoute(origin, destination, mode) {
        return new Promise((resolve, reject) => {
            var options = {
                host: 'maps.googleapis.com',
                path:
                    '/maps/api/directions/json?origin=' +
                    encodeURIComponent(origin) +
                    '&destination=' +
                    encodeURIComponent(destination) +
                    '&mode=' +
                    encodeURIComponent(mode) +
                    '&key=' +
                    process.env.API_KEY
            };

            https
                .get(options, function (response) {
                    var body = '';
                    response.on('data', function (d) {
                        body += d;
                    });
                    response.on('end', function () {
                        try {
                            var data = JSON.parse(body);

                            if (!data.routes || !data.routes[0]) {
                                return reject(new Error('No routes found in the response'));
                            }

                            const legs = data.routes[0].legs;
                            if (!legs || !legs[0]) {
                                return reject(new Error('No legs found in the route'));
                            }

                            resolve(legs[0]);
                        } catch (error) {
                            reject(new Error('Error parsing response: ' + error.message));
                        }
                    });
                })
                .on('error', function (error) {
                    reject(new Error('Request error: ' + error.message));
                });
        });
    }
};

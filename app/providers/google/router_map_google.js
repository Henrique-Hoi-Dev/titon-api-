import https from 'https';

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
                                return reject(new Error('INVALID_ROUTE_GOOGLE_MAPS'));
                            }

                            const legs = data.routes[0].legs;
                            if (!legs || !legs[0]) {
                                return reject(new Error('INVALID_ROUTE_GOOGLE_MAPS'));
                            }

                            resolve(legs[0]);
                        } catch (error) {
                            reject(new Error('ERROR_PARSING_RESPONSE: ' + error.message));
                        }
                    });
                })
                .on('error', function (error) {
                    reject(new Error('ERROR_REQUEST_GOOGLE_MAPS: ' + error.message));
                });
        });
    }
};

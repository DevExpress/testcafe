const { noop } = require('lodash');

const browserConnectionGatewayMock = {
    startServingConnection: noop,
    stopServingConnection:  noop,

    proxy: {
        resolveRelativeServiceUrl: noop,
    },
};

module.exports = {
    browserConnectionGatewayMock,
};

const { noop } = require('lodash');

const browserConnectionGatewayMock = {
    startServingConnection: noop,
    stopServingConnection:  noop,
    getConnections:         () => ({}),

    proxy: {
        resolveRelativeServiceUrl: noop,
    },
};

module.exports = {
    browserConnectionGatewayMock,
};

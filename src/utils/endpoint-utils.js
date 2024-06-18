const Promise      = require('pinkie-promise');
const createServer = require('net').createServer;
const { ip, ipv6 } = require('address');

function createServerOnFreePort () {
    return new Promise(resolve => {
        const server = createServer();

        server.once('listening', () => {
            resolve(server);
        });

        server.listen(0);
    });
}

function closeServers (servers) {
    return Promise.all(servers.map(server => {
        return new Promise(resolve => {
            server.once('close', resolve);
            server.close();
        });
    }));
}

function checkAvailability (port, hostname) {
    return new Promise(resolve => {
        const server = createServer();

        server.once('error', () => {
            resolve(false);
        });

        server.once('listening', () => {
            server.once('close', () => {
                resolve(true);
            });

            server.close();
        });

        server.listen(port, hostname);
    });
}

function isFreePort (port) {
    return checkAvailability(port);
}

function getFreePort () {
    return getFreePorts(1).then(ports => {
        return ports[0];
    });
}

function getFreePorts (count) {
    const serverPromises = [];
    let ports          = null;

    // NOTE: Sequentially collect listening
    // servers to avoid interference.
    for (let i = 0; i < count; i++)
        serverPromises.push(createServerOnFreePort());

    return Promise.all(serverPromises)
        .then(servers => {
            ports = servers.map(server => {
                return server.address().port;
            });

            return servers;
        })
        .then(closeServers)
        .then(() => {
            return ports;
        });
}

function isMyHostname (hostname) {
    return getFreePort()
        .then(port => {
            return checkAvailability(port, hostname);
        });
}

function getIPAddress () {
    return ip() || ipv6();
}

module.exports = {
    isFreePort:   isFreePort,
    getFreePort:  getFreePort,
    isMyHostname: isMyHostname,
    getIPAddress: getIPAddress,
};

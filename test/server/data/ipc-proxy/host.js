const { fork }                      = require('child_process');
const Transport                     = require('./transport');
const { inputFD, outputFD, syncFD } = require('./constants');
const { IPCProxy }                  = require('../../../../lib/services/utils/ipc/proxy');


class AsyncServiceHost {
    constructor (servicePath) {
        this.service   = fork(servicePath, { stdio: ['inherit', 'inherit', 'inherit', 'ipc', 'pipe', 'pipe', 'pipe']});

        this.transport = new Transport(this.service.stdio[inputFD], this.service.stdio[outputFD], this.service.stdio[syncFD], true);
        this.proxy     = new IPCProxy(this.transport);

        this.proxy.register(this.hostMethod, this);
    }

    async remoteMethod (...args) {
        return await this.proxy.call('remoteMethod', ...args);
    }

    async hostMethod (...args) {
        return args;
    }

    async throwError (message) {
        return await this.proxy.call('throwError', message);
    }

    async close () {
        this.service.kill();
    }
}

module.exports = AsyncServiceHost;


const Transport    = require('./transport');
const { inputFD, outputFD, syncFD } = require('./constants');
const { IPCProxy } = require('../../../../lib/services/utils/ipc/proxy');


class AsyncService {
    constructor () {
        this.transport = new Transport(outputFD, inputFD, syncFD);
        this.proxy     = new IPCProxy(this.transport);

        this.proxy.register(this.remoteMethod, this);
    }

    async remoteMethod (...args) {
        const resultFromHost = await this.proxy.call('hostMethod', 'ok');

        return args.concat(42, resultFromHost);
    }
}

new AsyncService();

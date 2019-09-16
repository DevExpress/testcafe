const Transport                     = require('./transport');
const { inputFD, outputFD, syncFD } = require('./constants');
const { IPCProxy }                  = require('../../../../lib/services/utils/ipc/proxy');


class SyncService {
    constructor () {
        this.transport = new Transport(outputFD, inputFD, syncFD);
        this.proxy     = new IPCProxy(this.transport);

        this.proxy.register(this.remoteMethod, this);
    }

    remoteMethod (...args) {
        const resultFromHost = this.proxy.callSync('hostMethod', 'ok');

        return args.concat(42, resultFromHost);
    }
}

new SyncService();

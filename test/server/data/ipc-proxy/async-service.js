const Transport    = require('./transport');
const { inputFD, outputFD, syncFD } = require('./constants');
const { IPCProxy } = require('../../../../lib/services/utils/ipc/proxy');


class AsyncService {
    constructor () {
        this.transport = new Transport(outputFD, inputFD, syncFD);
        this.proxy     = new IPCProxy(this.transport);

        this.proxy.register(this.remoteMethod, this);
        this.proxy.register(this.throwError, this);
    }

    async remoteMethod (...args) {
        const resultFromHost = await this.proxy.call('hostMethod', 'ok');

        return args.concat(42, resultFromHost);
    }

    async throwError (message) {
        class MyError extends Error {

        }

        MyError.prototype.name = 'MyError';

        throw new MyError(message);
    }
}

new AsyncService();

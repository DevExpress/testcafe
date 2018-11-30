import Emittery from 'emittery/legacy';
import Promise from 'pinkie';


export default class AsyncEventEmitter extends Emittery {
    once (event, listener) {
        return new Promise((resolve, reject) => {
            const off = this.on(event, function (data) {
                try {
                    off();

                    const result = listener ? listener.call(this, data) : data;

                    resolve(result);

                    return result;
                }
                catch (e) {
                    reject(e);

                    throw e;
                }
            });
        });
    }
}

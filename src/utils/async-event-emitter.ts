import Emittery from 'emittery';

export default class AsyncEventEmitter extends Emittery {
    public once (event: string, listener?: Function): Promise<any> {
        return new Promise((resolve, reject) => {
            const off = this.on(event, data => {
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

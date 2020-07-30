import Emittery from 'emittery';

export default class AsyncEventEmitter extends Emittery {
    public once (event: string, listener?: Function): Promise<any> { // eslint-disable-line @typescript-eslint/no-explicit-any
        if (!listener)
            return super.once(event);

        const unsubscribe = this.on(event, async data => {
            unsubscribe();

            return listener(data);
        });

        return Promise.resolve();
    }

    public emit (eventName: string, ...args: unknown[]): Promise<void> {
        const emitPromise = super.emit(eventName, ...args);

        if (eventName !== 'error')
            emitPromise.catch(reason => this.emit('error', reason));

        return emitPromise;
    }
}

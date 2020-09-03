import Emittery from 'emittery';

export default class AsyncEventEmitter extends Emittery {
    private readonly captureRejections: boolean;

    public constructor ({ captureRejections = false } = {}) {
        super();

        this.captureRejections = captureRejections;
    }

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

        if (this.captureRejections && eventName !== 'error')
            emitPromise.catch(reason => this.emit('error', reason));

        return emitPromise;
    }
}

import AsyncEventEmitter from './async-event-emitter';

export default class MessageBus extends AsyncEventEmitter {
    public abort (): void {
        this.clearListeners();
    }
}

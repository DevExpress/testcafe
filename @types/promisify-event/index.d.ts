declare module 'promisify-event' {
    import EventEmitter = NodeJS.EventEmitter;

    export default function (emitter: EventEmitter, event: string): Promise<any>;
}

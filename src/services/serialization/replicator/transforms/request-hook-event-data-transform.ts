import {
    ConfigureResponseEvent,
    RequestEvent,
    ResponseEvent
} from 'testcafe-hammerhead';


const EVENT_CONSTRUCTORS = [
    RequestEvent,
    ConfigureResponseEvent,
    ResponseEvent
];

type EventConstructor = typeof RequestEvent | typeof ConfigureResponseEvent | typeof ResponseEvent;

const EVENT_CONSTRUCTORS_MAP = new Map<string, EventConstructor>(EVENT_CONSTRUCTORS.map(eventConstructor => {
    return [eventConstructor.name, eventConstructor];
}));

interface SerializedRequestHookEvent {
    constructorName: string;
    data: unknown;
}

export default class RequestHookEventDataTransform {
    public readonly type: string;

    public constructor () {
        this.type = 'RequestHookEventData';
    }

    public shouldTransform (_: unknown, val: unknown): boolean {
        return EVENT_CONSTRUCTORS.some(EventConstructor => val instanceof EventConstructor);
    }

    public toSerializable (value: RequestEvent | ConfigureResponseEvent | ResponseEvent): SerializedRequestHookEvent {
        // TODO: Remove eventData._requestContext into 'testcafe-hammerhead' module
        // after switching to the compiler service mode.

        // NOTE: Access to the deprecated property inside of the unserializable 'eventData._requestContext' property
        // causes the node's deprecation warning.
        const clonedEventData = Object.assign({}, value);

        // @ts-ignore
        delete clonedEventData._requestContext;

        return {
            constructorName: value.constructor.name,
            data:            clonedEventData
        };
    }

    public fromSerializable (value: SerializedRequestHookEvent): unknown {
        const EventConstructor = EVENT_CONSTRUCTORS_MAP.get(value.constructorName);

        if (!EventConstructor)
            throw new Error(`An appropriate command constructor for "${value.constructorName}" type was not found.`);

        return EventConstructor.from(value.data);
    }
}

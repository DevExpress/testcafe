import { ProtocolApi } from 'chrome-remote-interface';
import { StatusCodes } from 'http-status-codes';
import Protocol from 'devtools-protocol';
import RequestPausedEvent = Protocol.Fetch.RequestPausedEvent;
import FrameNavigatedEvent = Protocol.Page.FrameNavigatedEvent;
import { IncomingMessageLike } from 'testcafe-hammerhead';
import { convertToHeaderEntries } from './headers';
import { EventType } from '../types';
import simulateMouseMove from '../../shared/utils/simulate-mouse-move';


export async function redirect (client: ProtocolApi, requestId: string, url: string): Promise<void> {
    await client.Fetch.fulfillRequest({
        requestId,
        responseCode:    StatusCodes.MOVED_PERMANENTLY,
        responseHeaders: [
            { name: 'location', value: url },
        ],
    });
}

export async function navigateTo (client: ProtocolApi, url: string): Promise<void> {
    await client.Page.navigate({ url });
}

async function dispatchMouseMoveEventSequence (client: ProtocolApi, options: any): Promise<void> {
    await simulateMouseMove(options, Date.now, async currPosition => {
        await client.Input.dispatchMouseEvent({
            type: 'mouseMoved',
            x:    currPosition.x as number,
            y:    currPosition.y as number,
        });
    });
}

export async function dispatchEvent (client: ProtocolApi, type: EventType, options: any): Promise<void> {
    switch (+type) {
        case EventType.Mouse:
            if (options.type === 'mouseMoved')
                await dispatchMouseMoveEventSequence(client, options);
            else
                await client.Input.dispatchMouseEvent(options);
            break;
        case EventType.Keyboard:
            await client.Input.dispatchKeyEvent(options);
            break;
        case EventType.Touch:
            await client.Input.dispatchTouchEvent(options);
            break;
        default:
            throw new Error(`Unknown "${options.type}" event type`);
    }
}

export function isRequest (event: RequestPausedEvent): boolean {
    return event.responseStatusCode === void 0;
}

export function isUnauthorized (statusCode: number): boolean {
    return statusCode === 401;
}

export function isRequestPausedEvent (val: any): val is RequestPausedEvent {
    return val && val.frameId && typeof val.request === 'object';
}

export function isPreflightRequest (event: RequestPausedEvent): boolean {
    return event.request.method === 'OPTIONS';
}

export function createRequestPausedEventForResponse (mockedResponse: IncomingMessageLike, requestEvent: RequestPausedEvent): RequestPausedEvent {
    return Object.assign({}, requestEvent, {
        responseStatusCode: mockedResponse.statusCode,
        responseHeaders:    convertToHeaderEntries(mockedResponse.headers),
    });
}

export function getRequestId (event: RequestPausedEvent | FrameNavigatedEvent): string {
    if (isRequestPausedEvent(event))
        return event.networkId as string;

    return event.frame.loaderId;
}

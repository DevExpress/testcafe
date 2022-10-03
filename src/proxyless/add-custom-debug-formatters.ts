import debug from 'debug';
import Protocol from 'devtools-protocol';
import RequestPausedEvent = Protocol.Fetch.RequestPausedEvent;
import FrameNavigatedEvent = Protocol.Page.FrameNavigatedEvent;
import { isRequest } from './utils/cdp';


export default function (): void {
    debug.formatters.r = (event: RequestPausedEvent): string => {
        const requestStr = isRequest(event) ? 'request' : 'response';

        return `requestPaused ${event.requestId} ${requestStr} ${event.request.url}`;
    };

    debug.formatters.f = (event: FrameNavigatedEvent): string => {
        return `frameNavigated ${event.frame.url} ${event.type}`;
    };
}

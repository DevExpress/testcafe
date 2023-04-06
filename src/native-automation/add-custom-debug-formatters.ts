import debug from 'debug';
import Protocol from 'devtools-protocol';
import RequestPausedEvent = Protocol.Fetch.RequestPausedEvent;
import FrameNavigatedEvent = Protocol.Page.FrameNavigatedEvent;
import LoadingFailedEvent = Protocol.Network.LoadingFailedEvent;
import { isRequest } from './utils/cdp';


export default function (): void {
    debug.formatters.r = (event: RequestPausedEvent): string => {
        const requestStr = isRequest(event) ? 'request' : 'response';

        return `requestPaused ${event.networkId} ${event.requestId} ${requestStr} ${event.request.url}`;
    };

    debug.formatters.f = (event: FrameNavigatedEvent): string => {
        return `frameNavigated ${event.frame.url} ${event.type}`;
    };

    debug.formatters.l = (event: LoadingFailedEvent): string => {
        return `loadingFailed ${event.requestId} ${event.errorText}`;
    };
}

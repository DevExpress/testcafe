import { EventEmitter } from 'events';
import promisifyEvent from 'promisify-event';
import getTimeLimitedPromise from 'time-limit-promise';
import { Dictionary } from '../../configuration/interfaces';
import BrowserConnection from './index';

const REMOTE_REDIRECT_TIMEOUT           = 10000;
const ADDING_CONNECTION_WAITING_TIMEOUT = 10000;

interface PendingConnection {
    connection: BrowserConnection;
    readyPromise: Promise<void>;
}

export default class RemotesQueue {
    private readonly events: EventEmitter;
    private shiftingTimeout: Promise<void>;
    private readonly pendingConnections: Dictionary<PendingConnection>;

    public constructor () {
        this.events             = new EventEmitter();
        this.shiftingTimeout    = Promise.resolve();
        this.pendingConnections = {};
    }

    public add (remoteConnection: BrowserConnection): void {
        const connectionReadyPromise = promisifyEvent(remoteConnection, 'ready')
            .then(() => this.remove(remoteConnection));

        this.pendingConnections[remoteConnection.id] = {
            connection:   remoteConnection,
            readyPromise: connectionReadyPromise
        };

        this.events.emit('connection-added', remoteConnection.id);
    }

    public remove (remoteConnection: BrowserConnection): void {
        delete this.pendingConnections[remoteConnection.id];
    }

    public shift (): Promise<BrowserConnection | null> {
        const shiftingPromise = this.shiftingTimeout
            .then(async () => {
                let headId = Object.keys(this.pendingConnections)[0];

                if (!headId)
                    headId = await getTimeLimitedPromise(promisifyEvent(this.events, 'connection-added'), ADDING_CONNECTION_WAITING_TIMEOUT);

                return headId ? this.pendingConnections[headId].connection : null;
            });

        this.shiftingTimeout = shiftingPromise
            .then(connection => {
                if (!connection)
                    return Promise.resolve();

                return getTimeLimitedPromise(this.pendingConnections[connection.id].readyPromise, REMOTE_REDIRECT_TIMEOUT);
            });

        return shiftingPromise;
    }
}

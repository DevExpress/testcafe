import Promise from 'pinkie';
import { EventEmitter } from 'events';
import promisifyEvent from 'promisify-event';
import timeLimit from 'time-limit-promise';


const REMOTE_REDIRECT_TIMEOUT           = 10000;
const ADDING_CONNECTION_WAITING_TIMEOUT = 10000;

export default class RemotesQueue {
    constructor () {
        this.events             = new EventEmitter();
        this.shiftingTimeout    = Promise.resolve();
        this.pendingConnections = {};
    }

    add (remoteConnection) {
        var connectionReadyPromise = promisifyEvent(remoteConnection, 'ready')
            .then(() => this.remove(remoteConnection));

        this.pendingConnections[remoteConnection.id] = {
            connection:   remoteConnection,
            readyPromise: connectionReadyPromise
        };

        this.events.emit('connection-added', remoteConnection.id);
    }

    remove (remoteConnection) {
        delete this.pendingConnections[remoteConnection.id];
    }

    shift () {
        var shiftingPromise = this.shiftingTimeout
            .then(async () => {
                var headId = Object.keys(this.pendingConnections)[0];

                if (!headId)
                    headId = await timeLimit(promisifyEvent(this.events, 'connection-added'), ADDING_CONNECTION_WAITING_TIMEOUT);

                return headId ? this.pendingConnections[headId].connection : null;
            });

        this.shiftingTimeout = shiftingPromise
            .then(connection => {
                if (!connection)
                    return Promise.resolve();

                return timeLimit(this.pendingConnections[connection.id].readyPromise, REMOTE_REDIRECT_TIMEOUT);
            });

        return shiftingPromise;
    }
}

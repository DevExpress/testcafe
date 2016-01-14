import { EventEmitter } from 'events';
import Promise from 'pinkie';
import timeLimit from 'time-limit-promise';
import promisifyEvent from 'promisify-event';
import noop from 'noop-fn';
import LocalBrowserConnection from '../browser-connection/local';
import { MESSAGE, getText } from '../messages';
import remove from '../utils/array-remove';


export default class BrowserSet extends EventEmitter {
    constructor (connections) {
        super();

        this.READY_TIMEOUT   = 30000;
        this.RELEASE_TIMEOUT = 10000;

        this.pendingReleases = [];

        this.connections = connections;

        this.browserErrorHandler = error => this.emit('error', error);

        connections.forEach(bc => bc.on('error', this.browserErrorHandler));

        // NOTE: We're setting an empty error handler, because Node kills the process on an 'error' event
        // if there is no handler. See: https://nodejs.org/api/events.html#events_class_events_eventemitter
        this.on('error', noop);
    }

    static async _waitIdle (bc) {
        if (bc.idle || bc.closed || !bc.ready)
            return;

        var idlePromise  = promisifyEvent(bc, 'idle');
        var closePromise = promisifyEvent(bc, 'closed');

        await Promise.race([
            idlePromise,
            closePromise
        ]);

        // NOTE: We must delete both listeners from the browser connection after
        // one of them is executed to avoid exceeding the subscribers limit.
        idlePromise.cancel();
        closePromise.cancel();
    }

    static async _closeConnection (bc) {
        if (bc.closed || !bc.ready)
            return;

        bc.close();

        await promisifyEvent(bc, 'closed');
    }

    _waitConnectionsReady () {
        var connectionsReadyPromise = Promise.all(
            this.connections
                .filter(bc => !bc.ready)
                .map(bc => promisifyEvent(bc, 'ready'))
        );

        var timeoutError = new Error(getText(MESSAGE.cantEstablishBrowserConnection));

        return timeLimit(connectionsReadyPromise, this.READY_TIMEOUT, { rejectWith: timeoutError });
    }

    _checkForDisconnections () {
        var disconnectedUserAgents = this.connections
            .filter(bc => bc.closed)
            .map(bc => bc.userAgent);

        if (disconnectedUserAgents.length)
            throw new Error(getText(MESSAGE.cantRunAgainstDisconnectedBrowsers, disconnectedUserAgents.join(', ')));
    }


    //API
    static from (connections) {
        var browserSet = new BrowserSet(connections);

        var prepareConnection = Promise.resolve()
            .then(() => {
                browserSet._checkForDisconnections();
                return browserSet._waitConnectionsReady();
            })
            .then(() => browserSet);

        return Promise
            .race([
                prepareConnection,
                promisifyEvent(browserSet, 'error')
            ])
            .catch(async error => {
                await browserSet.dispose();

                throw error;
            });
    }

    releaseConnection (bc) {
        if (this.connections.indexOf(bc) < 0)
            return Promise.resolve();

        remove(this.connections, bc);

        bc.removeListener('error', this.browserErrorHandler);

        var appropriateStateSwitch = bc instanceof LocalBrowserConnection ?
                                     BrowserSet._closeConnection(bc) :
                                     BrowserSet._waitIdle(bc);

        var release = timeLimit(appropriateStateSwitch, this.RELEASE_TIMEOUT).then(() => remove(this.pendingReleases, release));

        this.pendingReleases.push(release);

        return release;
    }

    async dispose () {
        // FIXME: make a shallow copy of `this.connections`, because it
        // will be modified inside `releaseConnection`.
        // Not the most clear piece of code here. I hope we can do
        // better. But I'm out of ideas for now.
        this.connections.slice().forEach(bc => this.releaseConnection(bc));

        await Promise.all(this.pendingReleases);
    }
}

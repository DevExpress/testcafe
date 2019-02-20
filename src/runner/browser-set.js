import { EventEmitter } from 'events';
import Promise from 'pinkie';
import getTimeLimitedPromise from 'time-limit-promise';
import promisifyEvent from 'promisify-event';
import { noop, pull as remove, flatten } from 'lodash';
import mapReverse from 'map-reverse';
import { GeneralError } from '../errors/runtime';
import { RUNTIME_ERRORS } from '../errors/types';

const LOCAL_BROWSERS_READY_TIMEOUT  = 2 * 60 * 1000;
const REMOTE_BROWSERS_READY_TIMEOUT = 6 * 60 * 1000;

export default class BrowserSet extends EventEmitter {
    constructor (browserConnectionGroups) {
        super();

        this.RELEASE_TIMEOUT = 10000;

        this.pendingReleases = [];

        this.browserConnectionGroups = browserConnectionGroups;
        this.browserConnections      = flatten(browserConnectionGroups);

        this.connectionsReadyTimeout = null;

        this.browserErrorHandler = error => this.emit('error', error);

        this.browserConnections.forEach(bc => bc.on('error', this.browserErrorHandler));

        // NOTE: We're setting an empty error handler, because Node kills the process on an 'error' event
        // if there is no handler. See: https://nodejs.org/api/events.html#events_class_events_eventemitter
        this.on('error', noop);
    }

    static async _waitIdle (bc) {
        if (bc.idle || !bc.ready)
            return;

        await promisifyEvent(bc, 'idle');
    }

    static async _closeConnection (bc) {
        if (bc.closed || !bc.ready)
            return;

        bc.close();

        await promisifyEvent(bc, 'closed');
    }

    async _getReadyTimeout () {
        const isLocalBrowser      = connection => connection.provider.isLocalBrowser(connection.id, connection.browserInfo.browserName);
        const remoteBrowsersExist = (await Promise.all(this.browserConnections.map(isLocalBrowser))).indexOf(false) > -1;

        return remoteBrowsersExist ? REMOTE_BROWSERS_READY_TIMEOUT : LOCAL_BROWSERS_READY_TIMEOUT;
    }

    _createPendingConnectionPromise (readyPromise, timeout, timeoutError) {
        const timeoutPromise = new Promise((_, reject) => {
            this.connectionsReadyTimeout = setTimeout(() => reject(timeoutError), timeout);
        });

        return Promise
            .race([readyPromise, timeoutPromise])
            .then(
                value => {
                    this.connectionsReadyTimeout.unref();
                    return value;
                },
                error => {
                    this.connectionsReadyTimeout.unref();
                    throw error;
                }
            );
    }

    async _waitConnectionsOpened () {
        const connectionsReadyPromise = Promise.all(
            this.browserConnections
                .filter(bc => !bc.opened)
                .map(bc => promisifyEvent(bc, 'opened'))
        );

        const timeoutError = new GeneralError(RUNTIME_ERRORS.cannotEstablishBrowserConnection);
        const readyTimeout = await this._getReadyTimeout();

        await this._createPendingConnectionPromise(connectionsReadyPromise, readyTimeout, timeoutError);
    }

    _checkForDisconnections () {
        const disconnectedUserAgents = this.browserConnections
            .filter(bc => bc.closed)
            .map(bc => bc.userAgent);

        if (disconnectedUserAgents.length)
            throw new GeneralError(RUNTIME_ERRORS.cannotRunAgainstDisconnectedBrowsers, disconnectedUserAgents.join(', '));
    }


    //API
    static from (browserConnections) {
        const browserSet = new BrowserSet(browserConnections);

        const prepareConnection = Promise.resolve()
            .then(() => {
                browserSet._checkForDisconnections();
                return browserSet._waitConnectionsOpened();
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
        if (this.browserConnections.indexOf(bc) < 0)
            return Promise.resolve();

        remove(this.browserConnections, bc);

        bc.removeListener('error', this.browserErrorHandler);

        const appropriateStateSwitch = !bc.permanent ?
            BrowserSet._closeConnection(bc) :
            BrowserSet._waitIdle(bc);

        const release = getTimeLimitedPromise(appropriateStateSwitch, this.RELEASE_TIMEOUT).then(() => remove(this.pendingReleases, release));

        this.pendingReleases.push(release);

        return release;
    }

    async dispose () {
        // NOTE: When browserConnection is cancelled, it is removed from
        // the this.connections array, which leads to shifting indexes
        // towards the beginning. So, we must copy the array in order to iterate it,
        // or we can perform iteration from the end to the beginning.
        if (this.connectionsReadyTimeout)
            this.connectionsReadyTimeout.unref();

        mapReverse(this.browserConnections, bc => this.releaseConnection(bc));

        await Promise.all(this.pendingReleases);
    }
}

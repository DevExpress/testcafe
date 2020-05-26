import { EventEmitter } from 'events';
import getTimeLimitedPromise from 'time-limit-promise';
import promisifyEvent from 'promisify-event';
import { flatten, noop, pull as remove } from 'lodash';
// @ts-ignore
import mapReverse from 'map-reverse';
import { GeneralError } from '../errors/runtime';
import { RUNTIME_ERRORS } from '../errors/types';
import BrowserConnection from '../browser/connection';
import BrowserConnectionStatus from '../browser/connection/status';

const LOCAL_BROWSERS_READY_TIMEOUT  = 2 * 60 * 1000;
const REMOTE_BROWSERS_READY_TIMEOUT = 6 * 60 * 1000;
const RELEASE_TIMEOUT               = 10000;

export default class BrowserSet extends EventEmitter {
    private readonly _browserConnections: BrowserConnection[];
    private readonly _browserErrorHandler: (error: Error) => void;
    private readonly _pendingReleases: Promise<void>[];
    private _connectionsReadyTimeout: null | NodeJS.Timeout;
    public browserConnectionGroups: BrowserConnection[][];

    public constructor (browserConnectionGroups: BrowserConnection[][]) {
        super();

        this._pendingReleases         = [];
        this.browserConnectionGroups  = browserConnectionGroups;
        this._browserConnections      = flatten(browserConnectionGroups);
        this._connectionsReadyTimeout = null;

        this._browserErrorHandler = (error: Error) => this.emit('error', error);

        this._browserConnections.forEach(bc => bc.on('error', this._browserErrorHandler));

        // NOTE: We're setting an empty error handler, because Node kills the process on an 'error' event
        // if there is no handler. See: https://nodejs.org/api/events.html#events_class_events_eventemitter
        this.on('error', noop);
    }

    private static async _waitIdle (bc: BrowserConnection): Promise<void> {
        if (bc.idle || !bc.isReady())
            return;

        await promisifyEvent(bc, 'idle');
    }

    private static async _closeConnection (bc: BrowserConnection): Promise<void> {
        if (bc.status === BrowserConnectionStatus.closed || !bc.isReady())
            return;

        bc.close();

        await promisifyEvent(bc, 'closed');
    }

    private async _getReadyTimeout (): Promise<number> {
        const isLocalBrowser      = (connection: BrowserConnection): boolean => connection.provider.isLocalBrowser(connection.id, connection.browserInfo.browserName);
        const remoteBrowsersExist = (await Promise.all(this._browserConnections.map(isLocalBrowser))).indexOf(false) > -1;

        return remoteBrowsersExist ? REMOTE_BROWSERS_READY_TIMEOUT : LOCAL_BROWSERS_READY_TIMEOUT;
    }

    private _createPendingConnectionPromise (readyPromise: Promise<BrowserConnection[]>, timeout: number, timeoutError: GeneralError): Promise<unknown> {
        const timeoutPromise = new Promise((_, reject) => {
            this._connectionsReadyTimeout = setTimeout(() => reject(timeoutError), timeout);
        });

        return Promise
            .race([readyPromise, timeoutPromise])
            .then(
                value => {
                    (this._connectionsReadyTimeout as NodeJS.Timeout).unref();

                    return value;
                },
                error => {
                    (this._connectionsReadyTimeout as NodeJS.Timeout).unref();

                    throw error;
                }
            );
    }

    private async _waitConnectionsOpened (): Promise<void> {
        const connectionsReadyPromise = Promise.all(
            this._browserConnections
                .filter(bc => bc.status !== BrowserConnectionStatus.opened)
                .map(bc => promisifyEvent(bc, 'opened'))
        );

        const timeoutError = new GeneralError(RUNTIME_ERRORS.cannotEstablishBrowserConnection);
        const readyTimeout = await this._getReadyTimeout();

        await this._createPendingConnectionPromise(connectionsReadyPromise, readyTimeout, timeoutError);
    }

    private _checkForDisconnections (): void {
        const disconnectedUserAgents = this._browserConnections
            .filter(bc => bc.status === BrowserConnectionStatus.closed)
            .map(bc => bc.userAgent);

        if (disconnectedUserAgents.length)
            throw new GeneralError(RUNTIME_ERRORS.cannotRunAgainstDisconnectedBrowsers, disconnectedUserAgents.join(', '));
    }


    //API
    public static from (browserConnections: BrowserConnection[][]): Promise<BrowserSet> {
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

    public releaseConnection (bc: BrowserConnection): Promise<void> {
        if (!this._browserConnections.includes(bc))
            return Promise.resolve();

        remove(this._browserConnections, bc);

        bc.removeListener('error', this._browserErrorHandler);

        const appropriateStateSwitch = bc.permanent ?
            BrowserSet._waitIdle(bc) :
            BrowserSet._closeConnection(bc);

        const release = getTimeLimitedPromise(appropriateStateSwitch, RELEASE_TIMEOUT)
            .then(() => remove(this._pendingReleases, release)) as Promise<void>;

        this._pendingReleases.push(release);

        return release;
    }

    public async dispose (): Promise<void> {
        // NOTE: When browserConnection is cancelled, it is removed from
        // the this.connections array, which leads to shifting indexes
        // towards the beginning. So, we must copy the array in order to iterate it,
        // or we can perform iteration from the end to the beginning.
        if (this._connectionsReadyTimeout)
            this._connectionsReadyTimeout.unref();

        mapReverse(this._browserConnections, (bc: BrowserConnection) => this.releaseConnection(bc));

        await Promise.all(this._pendingReleases);
    }
}

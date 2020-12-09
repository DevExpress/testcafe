import { EventEmitter } from 'events';
import getTimeLimitedPromise from 'time-limit-promise';
import promisifyEvent from 'promisify-event';
import {
    flatten,
    noop,
    pull as remove
} from 'lodash';

// @ts-ignore
import mapReverse from 'map-reverse';
import { BrowserConnectionError, GeneralError } from '../errors/runtime';
import { RUNTIME_ERRORS } from '../errors/types';
import BrowserConnection from '../browser/connection';
import BrowserConnectionStatus from '../browser/connection/status';
import { BrowserSetOptions } from './interfaces';

const RELEASE_TIMEOUT = 10000;

export default class BrowserSet extends EventEmitter {
    private readonly _browserConnections: BrowserConnection[];
    private readonly _browserErrorHandler: (error: Error) => void;
    private readonly _pendingReleases: Promise<void>[];
    private readonly _options: BrowserSetOptions;
    public browserConnectionGroups: BrowserConnection[][];

    public constructor (browserConnectionGroups: BrowserConnection[][], options: BrowserSetOptions) {
        super();

        this._pendingReleases         = [];
        this.browserConnectionGroups  = browserConnectionGroups;
        this._browserConnections      = flatten(browserConnectionGroups);
        this._options                 = options;

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
        if (bc.status === BrowserConnectionStatus.closed || bc.status === BrowserConnectionStatus.closing)
            return;

        await bc.close();
    }

    private async _waitConnectionsOpened (): Promise<any[]> {
        const openedConnections: Promise<any>[] = [];

        for (const bc of this._browserConnections) {
            if (bc.status !== BrowserConnectionStatus.opened) {
                const openedTimeout = this._options.browserInitTimeout || await bc.getDefaultBrowserInitTimeout();
                const timeoutErr    = new GeneralError(RUNTIME_ERRORS.cannotEstablishBrowserConnection);
                const openedOrError = Promise.race([
                    promisifyEvent(this, 'error'),
                    promisifyEvent(bc, 'opened')
                ]);

                const openedConnection = getTimeLimitedPromise(openedOrError, openedTimeout, { rejectWith: timeoutErr });

                openedConnections.push(openedConnection);
            }
        }

        return Promise.all(openedConnections);
    }

    private _checkForDisconnections (): void {
        const disconnectedUserAgents = this._browserConnections
            .filter(bc => bc.status === BrowserConnectionStatus.closed)
            .map(bc => bc.userAgent);

        if (disconnectedUserAgents.length)
            throw new GeneralError(RUNTIME_ERRORS.cannotRunAgainstDisconnectedBrowsers, disconnectedUserAgents.join(', '));
    }

    public async prepareConnections (): Promise<void> {
        await this._checkForDisconnections();
        await this._waitConnectionsOpened();
    }

    // NOTE: creates and prepares BrowserSet instance with given browser connections
    public static async from (browserConnections: BrowserConnection[][], opts: BrowserSetOptions): Promise<BrowserSet> {
        const browserSet = new BrowserSet(browserConnections, opts);

        try {
            const prepareConnections = browserSet.prepareConnections();
            const browserSetError    = promisifyEvent(browserSet, 'error');

            await Promise.race([ prepareConnections, browserSetError ]);

            return browserSet;
        }
        catch (e) {
            let finalError = e;

            if (e.code === RUNTIME_ERRORS.cannotEstablishBrowserConnection)
                finalError = new BrowserConnectionError(e, browserSet.getConnections(), opts);

            await browserSet.dispose();

            throw finalError;
        }
    }

    private getConnections (): BrowserConnection[] {
        return this._browserConnections;
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
        mapReverse(this._browserConnections, (bc: BrowserConnection) => this.releaseConnection(bc));

        await Promise.all(this._pendingReleases);
    }
}

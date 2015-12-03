import { EventEmitter } from 'events';
import { Promise } from 'es6-promise';
import once from 'once';
import LocalBrowserConnection from '../browser-connection/local';
import { MESSAGE, getText } from '../messages';
import remove from '../utils/array-remove';


export default class BrowserSet extends EventEmitter {
    constructor (connections) {
        super();

        this.BROWSER_CONNECTION_READY_TIMEOUT = 30000;
        this.WAITING_FOR_DISPOSE_TIMEOUT      = 10000;

        this.promisedDisposals = [];

        this.connections = connections;

        this.browserErrorHandler = msg => this.emit('error', msg);

        connections.forEach(bc => bc.on('error', this.browserErrorHandler));

        //NOTE: We're setting an empty error handler, because Node kills the process on an 'error' event
        //if there is no handler. See https://nodejs.org/api/events.html#events_class_events_eventemitter
        this.on('error', () => {});
    }

    _waitIdle (bc) {
        return new Promise(resolve => {
            if (bc.idle || bc.closed || !bc.ready) {
                resolve();
                return;
            }

            var eventHandler = once(() => resolve());

            bc.once('idle', eventHandler);
            bc.once('closed', eventHandler);
        });
    }

    _closeConnection (bc) {
        return new Promise(resolve => {
            if (bc.closed || !bc.ready) {
                resolve();
                return;
            }

            bc.close();
            bc.once('closed', resolve);
        });
    }

    _waitConnectionsReady () {
        var connectionsReadyPromise = Promise.all(
            this.connections
                .filter(bc => !bc.ready)
                .map(bc => new Promise(resolve => bc.once('ready', resolve)))
        );

        var readyTimeoutPromise = new Promise((resolve, reject) => {
            var timeout = setTimeout(() => {
                reject(new Error(getText(MESSAGE.cantEstablishBrowserConnection)));
            }, this.BROWSER_CONNECTION_READY_TIMEOUT);

            timeout.unref();
        });

        return Promise.race([
            connectionsReadyPromise,
            readyTimeoutPromise
        ]);
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

        var prepareConnectionsPromise = Promise.resolve()
            .then(() => {
                browserSet._checkForDisconnections();
                return browserSet._waitConnectionsReady();
            })
            .then(() => browserSet);

        var connectionsErrorPromise = new Promise(
            (resolve, reject) => browserSet.once('error', msg => reject(new Error(msg)))
        );

        return Promise
            .race([
                prepareConnectionsPromise,
                connectionsErrorPromise
            ])
            .catch(async error => {
                await browserSet.dispose();

                throw error;
            });
    }

    freeConnection (bc) {
        if (this.connections.indexOf(bc) === -1)
            return Promise.resolve();

        remove(this.connections, bc);

        bc.removeListener('error', this.browserErrorHandler);

        var disposePromise = bc instanceof LocalBrowserConnection ? this._closeConnection(bc) : this._waitIdle(bc);

        var disposeTimeoutPromise = new Promise(
            resolve => setTimeout(resolve, this.WAITING_FOR_DISPOSE_TIMEOUT).unref()
        );

        var promisedDisposal = Promise
            .race([
                disposePromise,
                disposeTimeoutPromise
            ])
            .then(() => remove(this.promisedDisposals, promisedDisposal));

        this.promisedDisposals.push(promisedDisposal);

        return promisedDisposal;
    }

    async dispose () {
        this.connections.slice().forEach(bc => this.freeConnection(bc));

        await Promise.all(this.promisedDisposals);
    }
}

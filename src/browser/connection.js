import { EventEmitter } from 'events';
import { parse as parseUserAgent } from 'useragent';
import { create as createUniqueId } from '../utils/unique-id';

export default class BrowserConnection extends EventEmitter {
    const HEARTBEAT_TIMEOUT = 2 * 60 * 1000;

    constructor (gateway) {
        super();

        this.id   = createUniqueId();
        this.jobs = [];

        this.userAgent        = null;
        this.browserInstance  = null;
        this.ready            = false;
        this.heartbeatTimeout = null;

        this.url          = `${gateway.domain}/browser/connect/${this.id}`;
        this.heartbeatUrl = `${gateway.domain}/browser/heartbeat/${this.id}`;
        this.idleUrl      = `${gateway.domain}/browser/idle/${this.id}`;
        this.statusUrl    = `${gateway.domain}/browser/status/${this.id}`;

        this.gateway = gateway;
        this.gateway.startServingConnection(this);
    }

    _waitForHeartbeat () {
        this.heartbeatTimeout = setTimeout(() => {
            this.close();
            this.emit('interrupt');
        }, BrowserConnection.HEARTBEAT_TIMEOUT);
    }

    // API
    close () {
        this.ready = false;
        this.gateway.stopServingConnection(this);
    }

    establish (userAgent) {
        this.ready     = true;
        this.userAgent = parseUserAgent(userAgent).toString();

        this._waitForHeartbeat();
        this.emit('ready');
    }

    heartbeat () {
        clearTimeout(this.heartbeatTimeout);
        this._waitForHeartbeat();
    }

    renderIdlePage () {
        //TODO
    }

}
import path from 'path';
import fs from 'fs';
import { EventEmitter } from 'events';
import Mustache from 'mustache';
import { parse as parseUserAgent } from 'useragent';
import read from '../utils/read-file-relative';


// Const
const IDLE_PAGE_TEMPLATE = read('./idle-page/index.html.mustache');


// Global instance counter used to generate ID's
var instanceCount = 0;


export default class BrowserConnection extends EventEmitter {
    const HEARTBEAT_TIMEOUT = 2 * 60 * 1000;

    constructor (gateway) {
        super();

        this.id      = ++instanceCount;
        this.jobs    = [];
        this.gateway = gateway;
        this.userAgent        = null;

        this.ready            = false;
        this.heartbeatTimeout = null;

        this.url          = `${gateway.domain}/browser/connect/${this.id}`;
        this.heartbeatUrl = `${gateway.domain}/browser/heartbeat/${this.id}`;
        this.idleUrl      = `${gateway.domain}/browser/idle/${this.id}`;
        this.statusUrl    = `${gateway.domain}/browser/status/${this.id}`;

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
        return Mustache.render(IDLE_PAGE_TEMPLATE, { id: this.id });
    }
}
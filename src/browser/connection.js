import { EventEmitter } from 'events';
import Mustache from 'mustache';
import { parse as parseUserAgent } from 'useragent';
import read from '../utils/read-file-relative';
import COMMANDS from './commands';
import { MESSAGES, getText } from '../messages';


// Const
const IDLE_PAGE_TEMPLATE = read('./idle-page/index.html.mustache');


// Global instance counter used to generate ID's
var instanceCount = 0;


export default class BrowserConnection extends EventEmitter {
    static HEARTBEAT_TIMEOUT = 2 * 60 * 1000;

    constructor (gateway) {
        super();

        this.id        = ++instanceCount;
        this.jobQueue  = [];
        this.gateway   = gateway;
        this.userAgent = null;

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
            this.emit('error', getText(MESSAGES.browserConnectionInterrupted, this.userAgent));
        }, BrowserConnection.HEARTBEAT_TIMEOUT);
    }

    _getNextTestRunUrl () {
        var job = this.jobQueue[0];

        return job ? job.getNextTestRunUrl() : null;
    }

    // API
    addJob (job) {
        this.jobQueue.push(job);

        job.once('done', () => {
            var idx = this.jobQueue.indexOf(job);

            this.jobQueue.splice(idx, 1);
        });
    }

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
        return Mustache.render(IDLE_PAGE_TEMPLATE, {
            id:        this.id,
            userAgent: this.userAgent,
            statusUrl: this.statusUrl
        });
    }

    getStatus () {
        var testRunUrl = this._getNextTestRunUrl();

        if (testRunUrl)
            return { cmd: COMMANDS.run, url: testRunUrl };

        return { cmd: COMMANDS.idle };
    }
}

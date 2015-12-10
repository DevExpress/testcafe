import { EventEmitter } from 'events';
import Mustache from 'mustache';
import { parse as parseUserAgent } from 'useragent';
import { readSync as read } from 'read-file-relative';
import COMMAND from './command';
import { MESSAGE, getText } from '../messages';
import remove from '../utils/array-remove';


// Const
const IDLE_PAGE_TEMPLATE = read('../client/browser/idle-page/index.html.mustache');


// Global instance counter used to generate ID's
var instanceCount = 0;


export default class BrowserConnection extends EventEmitter {
    constructor (gateway) {
        super();

        this.HEARTBEAT_TIMEOUT = 2 * 60 * 1000;

        this.id                       = ++instanceCount;
        this.jobQueue                 = [];
        this.browserConnectionGateway = gateway;
        this.userAgent                = null;

        this.closed           = false;
        this.ready            = false;
        this.idle             = true;
        this.heartbeatTimeout = null;

        this.url          = `${gateway.domain}/browser/connect/${this.id}`;
        this.heartbeatUrl = `${gateway.domain}/browser/heartbeat/${this.id}`;
        this.idleUrl      = `${gateway.domain}/browser/idle/${this.id}`;
        this.statusUrl    = `${gateway.domain}/browser/status/${this.id}`;

        this.on('error', () => this.close());

        this.browserConnectionGateway.startServingConnection(this);
    }

    _waitForHeartbeat () {
        this.heartbeatTimeout = setTimeout(() => {
            this.emit('error', new Error(getText(MESSAGE.browserDisconnected, this.userAgent)));
        }, this.HEARTBEAT_TIMEOUT);
    }

    _popNextTestRunUrl () {
        if (this.jobQueue.length) {
            var job = this.jobQueue[0];
            var url = job.popNextTestRunUrl();

            if (!job.hasQueuedTestRuns)
                this.jobQueue.shift();

            return url;
        }

        return null;
    }

    // API
    addJob (job) {
        this.jobQueue.push(job);
    }

    removeJob (job) {
        remove(this.jobQueue, job);
    }

    close () {
        this.browserConnectionGateway.stopServingConnection(this);
        clearTimeout(this.heartbeatTimeout);

        this.ready  = false;
        this.closed = true;

        this.emit('closed');
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
        this.idle = true;

        this.emit('idle');

        return Mustache.render(IDLE_PAGE_TEMPLATE, {
            userAgent:    this.userAgent,
            statusUrl:    this.statusUrl,
            heartbeatUrl: this.heartbeatUrl
        });
    }

    getStatus () {
        var testRunUrl = this._popNextTestRunUrl();

        if (testRunUrl) {
            this.idle = false;
            return { cmd: COMMAND.run, url: testRunUrl };
        }

        return { cmd: COMMAND.idle, url: this.idleUrl };
    }
}

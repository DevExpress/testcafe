import { EventEmitter } from 'events';
import Mustache from 'mustache';
import { parse as parseUserAgent } from 'useragent';
import read from '../utils/read-file-relative';
import COMMAND from './command';
import { MESSAGE, getText } from '../messages';
import { remove } from '../utils/array';


// Const
const IDLE_PAGE_TEMPLATE = read('../client/browser-idle-page/index.html.mustache');


// Global instance counter used to generate ID's
var instanceCount = 0;


export default class BrowserConnection extends EventEmitter {
    static HEARTBEAT_TIMEOUT = 2 * 60 * 1000;

    constructor (gateway) {
        super();

        this.id                       = ++instanceCount;
        this.jobQueue                 = [];
        this.browserConnectionGateway = gateway;
        this.userAgent                = null;

        this.ready            = false;
        this.heartbeatTimeout = null;

        this.url          = `${gateway.domain}/browser/connect/${this.id}`;
        this.heartbeatUrl = `${gateway.domain}/browser/heartbeat/${this.id}`;
        this.idleUrl      = `${gateway.domain}/browser/idle/${this.id}`;
        this.statusUrl    = `${gateway.domain}/browser/status/${this.id}`;

        this.browserConnectionGateway.startServingConnection(this);
    }

    _waitForHeartbeat () {
        this.heartbeatTimeout = setTimeout(() => {
            this.close();
            this.emit('error', getText(MESSAGE.browserDisconnected, this.userAgent.toString()));
        }, BrowserConnection.HEARTBEAT_TIMEOUT);
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
        this.ready = false;
        this.browserConnectionGateway.stopServingConnection(this);
        clearTimeout(this.heartbeatTimeout);
    }

    establish (userAgent) {
        this.ready     = true;
        this.userAgent = parseUserAgent(userAgent);

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
            userAgent: this.userAgent.toString(),
            statusUrl: this.statusUrl
        });
    }

    getStatus () {
        var testRunUrl = this._popNextTestRunUrl();

        if (testRunUrl)
            return { cmd: COMMAND.run, url: testRunUrl };

        return { cmd: COMMAND.idle };
    }
}

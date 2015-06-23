import { EventEmitter } from 'events';

export default class BrowserConnection extends EventEmitter {
    constructor (gateway) {
        this.gateway = gateway;

        this.url             = null;
        this.browserName     = null;
        this.browserInstance = null;
    }


    establish (userAgent) {

    }

    heartbeat () {

    }

    renderIdlePage () {

    }

}
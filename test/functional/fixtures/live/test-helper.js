const { EventEmitter } = require('events');

class TestHelper {
    constructor () {
        this._init();
    }

    _init () {
        this.emitter             =  new EventEmitter();
        this.counter             = 0;
        this.attempts            = 0;
        this.testCount           = 10;
        this.quarantineThreshold = 3;
        this.data                = {};
    }

    clean () {
        this._init();
    }

}

const helper = new TestHelper();

module.exports = helper;

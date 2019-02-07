const EventEmitter = require('events').EventEmitter;

class TestCompleteWatcher extends EventEmitter {
    contructor () {
    }
}

module.exports = {
    watcher:   new TestCompleteWatcher(),
    counter:   0,
    testCount: 10
};

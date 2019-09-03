const EventEmitter = require('events').EventEmitter;

class TestCompleteWatcher extends EventEmitter {}

module.exports = {
    watcher:             new TestCompleteWatcher(),
    counter:             0,
    attempts:            0,
    testCount:           10,
    quarantineThreshold: 3,
    data:                {}
};

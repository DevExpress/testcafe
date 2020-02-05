const AsyncEventEmitter = require('../../../../../lib/utils/async-event-emitter');

const on = AsyncEventEmitter.prototype.on;

const MAX_LISTENERS = {
    'Task': {
        'done':           3,
        'start':          2,
        'test-run-start': 2,
        'test-run-done':  2
    }
};

describe('[Regression](GH-4725)', function () {
    it('Should ensure AsyncEventEmitter from additional event subscriptions', function () {
        AsyncEventEmitter.prototype.on = function (eventName, listener) {
            let maxListenerCount = 1;

            if (MAX_LISTENERS[this.constructor.name])
                maxListenerCount = MAX_LISTENERS[this.constructor.name][eventName] || maxListenerCount;

            const result = on.call(this, eventName, listener);

            if (this.listenerCount(eventName) > maxListenerCount)
                throw new Error(`Check listeners for ${this.constructor.name}.${eventName}`);

            return result;
        };

        return runTests('testcafe-fixtures/index.js')
            .then(() => {
                AsyncEventEmitter.prototype.on = on;
            });
    });
});

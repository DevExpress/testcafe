const log = require('../../../lib/cli/log');

module.exports = {
    originalLogFunction: null,

    messages: {
        log: null,

        clear () {
            this.log = null;
        }
    },

    init () {
        this.originalLogFunction = log.write;
    },

    wrap () {
        log.write = this.log;
    },

    unwrap () {
        log.write = this.originalLogFunction;
    },

    // NOTE: We can't write `wrapper.log` as a method and use `this` inside it because it will replace a method of another object
    log: (...args) => {
        module.exports.messages.log = args.join();
    }
};

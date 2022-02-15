const ERRORS = {
    Client: 'E1',
    Server: 'E2',
    None:   '',
};

const SUCCESS_RESULT_ATTEMPTS = [
    ERRORS.Server,
    ERRORS.Client,
    ERRORS.None,
    ERRORS.None,
    ERRORS.None,
];

const FAIL_RESULT_ATTEMPTS = [
    ERRORS.Server,
    ERRORS.Client,
    ERRORS.None,
    ERRORS.None,
    ERRORS.Server,
];

const Counter = function () {
    this.counters = {};

    this.add = alias => {
        if (!this.counters.hasOwnProperty(alias))
            this.counters[alias] = -1;

        this.counters[alias]++;
    };
    this.get = alias => {
        return this.counters[alias];
    };
};

module.exports = {
    ERRORS,
    SUCCESS_RESULT_ATTEMPTS,
    FAIL_RESULT_ATTEMPTS,
    Counter,
};

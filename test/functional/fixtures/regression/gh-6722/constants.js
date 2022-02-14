const ERRORS = {
    Client: 'E1',
    Server: 'E2',
    None:   '',
};
const SUCCESS_RESULT_ATTEMPTS = {
    'Chrome': [
        ERRORS.Server,
        ERRORS.Client,
        ERRORS.None,
        ERRORS.None,
        ERRORS.None,
    ],
    'Firefox': [
        ERRORS.Server,
        ERRORS.None,
        ERRORS.Client,
        ERRORS.None,
        ERRORS.None,
    ],
    'Internet Explorer': [
        ERRORS.Server,
        ERRORS.None,
        ERRORS.None,
        ERRORS.Client,
        ERRORS.None,
    ],
};
const FAIL_RESULT_ATTEMPTS    = {
    'Chrome': [
        ERRORS.Client,
        ERRORS.Server,
        ERRORS.None,
        ERRORS.None,
        ERRORS.Client,
    ],
    'Firefox': [
        ERRORS.Client,
        ERRORS.None,
        ERRORS.Server,
        ERRORS.None,
        ERRORS.Client,
    ],
    'Internet Explorer': [
        ERRORS.Client,
        ERRORS.None,
        ERRORS.None,
        ERRORS.Server,
        ERRORS.Client,
    ],
};

module.exports = {
    ERRORS,
    SUCCESS_RESULT_ATTEMPTS,
    FAIL_RESULT_ATTEMPTS,
};

const EXCEPTION               = {
    Server: 'server',
    Client: 'client',
    None:   'none',
};
const SUCCESS_RESULT_ATTEMPTS = [
    EXCEPTION.Server,
    EXCEPTION.None,
    EXCEPTION.None,
    EXCEPTION.Client,
    EXCEPTION.None,
];
const FAIL_RESULT_ATTEMPTS    = [
    EXCEPTION.Client,
    EXCEPTION.None,
    EXCEPTION.None,
    EXCEPTION.Server,
    EXCEPTION.Client,
];

module.exports = {
    EXCEPTION,
    SUCCESS_RESULT_ATTEMPTS,
    FAIL_RESULT_ATTEMPTS,
};

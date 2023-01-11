const CLIENT_ERROR_MESSAGE   = 'Custom client error';
const CLIENT_ERROR_REGEXP    = /^c.*m.*error/i;
const CLIENT_PAGE_URL        = 'http://localhost:3000/fixtures/page-js-errors/pages/skip-js-errors.html';
const CLIENT_PAGE_URL_REGEXP = /.*skip-js.*\.html/;

const SKIP_JS_ERRORS_CALLBACK_OPTIONS = {
    fn:           ({ message, pageUrl }) => message === CLIENT_ERROR_MESSAGE && pageUrl === CLIENT_PAGE_URL,
    dependencies: {
        CLIENT_ERROR_MESSAGE,
        CLIENT_PAGE_URL,
    },
};

module.exports = {
    CLIENT_ERROR_MESSAGE,
    CLIENT_PAGE_URL,
    CLIENT_ERROR_REGEXP,
    CLIENT_PAGE_URL_REGEXP,
    SKIP_JS_ERRORS_CALLBACK_OPTIONS,
};

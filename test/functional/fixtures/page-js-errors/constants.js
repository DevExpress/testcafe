const CLIENT_ERROR_MESSAGE   = 'Custom client error';
const CLIENT_ERROR_REGEXP    = /^C.*m.*error/;
const CLIENT_PAGE_URL        = 'http://localhost:3000/fixtures/page-js-errors/pages/skip-js-errors.html';
const CLIENT_PAGE_URL_REGEXP = /.*skip-js.*\.html/;
const CALLBACK_FUNC_ERROR    = 'An error occurred in skipJsErrors handler code:';

module.exports = {
    CLIENT_ERROR_MESSAGE,
    CLIENT_PAGE_URL,
    CALLBACK_FUNC_ERROR,
    CLIENT_ERROR_REGEXP,
    CLIENT_PAGE_URL_REGEXP,
};

const MULTIPLE_WINDOWS_TESTS_GLOB = 'test/functional/fixtures/multiple-windows/test.js';
const COMPILER_SERVICE_TESTS_GLOB = 'test/functional/fixtures/compiler-service/test.js';
const LEGACY_TESTS_GLOB           = 'test/functional/legacy-fixtures/**/test.js';
const BASIC_TESTS_GLOB            = 'test/functional/fixtures/**/test.js';

const SCREENSHOT_TESTS_GLOB = [
    'test/functional/fixtures/api/es-next/take-screenshot/test.js',
    'test/functional/fixtures/screenshots-on-fails/test.js',
];

const TESTS_GLOB = [
    BASIC_TESTS_GLOB,
    `!${MULTIPLE_WINDOWS_TESTS_GLOB}`,
    `!${COMPILER_SERVICE_TESTS_GLOB}`,
];

const DEBUG_GLOB_1 = [
    MULTIPLE_WINDOWS_TESTS_GLOB,
    'test/functional/fixtures/regression/**/test.js',
    'test/functional/fixtures/api/es-next/selector/test.js',
    'test/functional/fixtures/api/raw/**/test.js',
];

const DEBUG_GLOB_2 = [
    BASIC_TESTS_GLOB,
    ...DEBUG_GLOB_1.map(glob => `!${glob}`),
    ...SCREENSHOT_TESTS_GLOB.map(glob => `!${glob}`),
];

const PROXYLESS_TESTS_GLOB = [
    ...SCREENSHOT_TESTS_GLOB,
    'test/functional/fixtures/app-command/test.js',
    'test/functional/fixtures/driver/test.js',
    'test/functional/fixtures/page-error/test.js',
    'test/functional/fixtures/page-js-errors/test.js',
    'test/functional/fixtures/api/es-next/disable-reloads/test.js',
    'test/functional/fixtures/quarantine/test.js',
    'test/functional/fixtures/api/es-next/cookies/test.js',
    'test/functional/fixtures/concurrency/test.js',
    'test/functional/fixtures/api/es-next/request-hooks/test.js',
    'test/functional/fixtures/api/es-next/iframe-switching/test.js',
    'test/functional/fixtures/api/es-next/console/test.js',
    'test/functional/fixtures/api/es-next/roles/test.js',
    'test/functional/fixtures/request-pipeline/**/test.js',
    'test/functional/fixtures/hammerhead/worker/test.js',
    'test/functional/fixtures/api/es-next/native-dialogs-handling/test.js',
    'test/functional/fixtures/api/es-next/native-dialogs-handling/iframe/test.js',
    'test/functional/fixtures/page-js-errors/test.js',
    'test/functional/fixtures/api/es-next/click/test.js',
    'test/functional/fixtures/api/es-next/assertions/test.js',
    'test/functional/fixtures/api/es-next/browser-info/test.js',
    'test/functional/fixtures/api/es-next/client-function/test.js',
    'test/functional/fixtures/api/es-next/compiler-options/test.js',
    'test/functional/fixtures/api/es-next/execution-timeout/test.js',
    'test/functional/fixtures/api/es-next/generic-errors/test.js',
    'test/functional/fixtures/api/es-next/global-hooks/test.js',
    'test/functional/fixtures/api/es-next/hooks/test.js',
    'test/functional/fixtures/api/es-next/auth/test.js',
    'test/functional/fixtures/regression/**/test.js',
    '!test/functional/fixtures/regression/gh-1138/test.js',
    '!test/functional/fixtures/regression/gh-1311/test.js',
    '!test/functional/fixtures/regression/gh-1388/test.js',
    '!test/functional/fixtures/regression/gh-1521/test.js',
    '!test/functional/fixtures/regression/gh-1846/test.js',
    '!test/functional/fixtures/regression/gh-2546/test.js',
    '!test/functional/fixtures/regression/gh-2601/test.js',
    '!test/functional/fixtures/regression/gh-2861/test.js',
    '!test/functional/fixtures/regression/gh-3127/test.js',
    '!test/functional/fixtures/regression/gh-423/test.js',
    '!test/functional/fixtures/regression/gh-5447/test.js',
    '!test/functional/fixtures/regression/gh-5886/test.js',
    '!test/functional/fixtures/regression/gh-664/test.js',
    '!test/functional/fixtures/regression/hammerhead/gh-2350/test.js',
    'test/functional/fixtures/api/es-next/custom-client-scripts/test.js',
];

module.exports = {
    TESTS_GLOB,
    LEGACY_TESTS_GLOB,
    MULTIPLE_WINDOWS_TESTS_GLOB,
    BASIC_TESTS_GLOB,
    COMPILER_SERVICE_TESTS_GLOB,
    DEBUG_GLOB_1,
    DEBUG_GLOB_2,
    SCREENSHOT_TESTS_GLOB,
    PROXYLESS_TESTS_GLOB,
};

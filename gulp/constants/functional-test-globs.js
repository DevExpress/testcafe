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

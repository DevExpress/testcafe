const MULTIPLE_WINDOWS_TESTS_GLOB      = 'test/functional/fixtures/multiple-windows/test.js';
const HEADED_CHROME_FIREFOX_TESTS_GLOB = ['test/functional/fixtures/live/test.js', 'test/functional/fixtures/ui/test.js'];
const COMPILER_SERVICE_TESTS_GLOB      = 'test/functional/fixtures/compiler-service/test.js';
const LEGACY_TESTS_GLOB                = 'test/functional/legacy-fixtures/**/test.js';
const BASIC_TESTS_GLOB                 = 'test/functional/fixtures/**/test.js';

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
    ...TESTS_GLOB,
    '!test/functional/fixtures/run-options/request-timeout/test.js',
    '!test/functional/fixtures/run-options/disable-page-caching/test.js',
    '!test/functional/fixtures/regression/gh-1311/test.js',
    '!test/functional/fixtures/hammerhead/gh-2622/test.js',
    '!test/functional/fixtures/regression/gh-2861/test.js',
    '!test/functional/fixtures/regression/gh-423/test.js',
    '!test/functional/fixtures/regression/gh-5886/test.js',
    '!test/functional/fixtures/regression/hammerhead/gh-2350/test.js',
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
    HEADED_CHROME_FIREFOX_TESTS_GLOB,
};

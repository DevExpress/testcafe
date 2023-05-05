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

module.exports = {
    TESTS_GLOB,
    LEGACY_TESTS_GLOB,
    MULTIPLE_WINDOWS_TESTS_GLOB,
    BASIC_TESTS_GLOB,
    COMPILER_SERVICE_TESTS_GLOB,
    SCREENSHOT_TESTS_GLOB,
    HEADED_CHROME_FIREFOX_TESTS_GLOB,
};

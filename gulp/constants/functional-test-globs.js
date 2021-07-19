const MULTIPLE_WINDOWS_TESTS_GLOB = 'test/functional/fixtures/multiple-windows/test.js';
const COMPILER_SERVICE_TESTS_GLOB = 'test/functional/fixtures/compiler-service/test.js';
const LEGACY_TESTS_GLOB           = 'test/functional/legacy-fixtures/**/test.js';
const BASIC_TESTS_GLOB            = 'test/functional/fixtures/**/test.js';

const TESTS_GLOB = [
    BASIC_TESTS_GLOB,
    `!${MULTIPLE_WINDOWS_TESTS_GLOB}`,
    `!${COMPILER_SERVICE_TESTS_GLOB}`,
];

const MIGRATE_ALL_TESTS_TO_COMPILER_SERVICE_GLOB = [
    BASIC_TESTS_GLOB,
    COMPILER_SERVICE_TESTS_GLOB,
    '!test/functional/fixtures/multiple-windows/test.js',
    '!test/functional/fixtures/regression/gh-2846/test.js',
];

module.exports = {
    TESTS_GLOB,
    LEGACY_TESTS_GLOB,
    MULTIPLE_WINDOWS_TESTS_GLOB,
    MIGRATE_ALL_TESTS_TO_COMPILER_SERVICE_GLOB,
    COMPILER_SERVICE_TESTS_GLOB,
};

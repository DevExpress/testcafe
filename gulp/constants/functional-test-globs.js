const MULTIPLE_WINDOWS_TESTS_GLOB = 'test/functional/fixtures/multiple-windows/test.js';
const COMPILER_SERVICE_TESTS_GLOB = 'test/functional/fixtures/compiler-service/test.js';
const LEGACY_TESTS_GLOB           = 'test/functional/legacy-fixtures/**/test.js';

const TESTS_GLOB = [
    'test/functional/fixtures/**/test.js',
    `!${MULTIPLE_WINDOWS_TESTS_GLOB}`,
    `!${COMPILER_SERVICE_TESTS_GLOB}`
];

const MIGRATE_ALL_TESTS_TO_COMPILER_SERVICE_GLOB = Array.from(TESTS_GLOB);

module.exports = {
    TESTS_GLOB,
    LEGACY_TESTS_GLOB,
    MULTIPLE_WINDOWS_TESTS_GLOB,
    MIGRATE_ALL_TESTS_TO_COMPILER_SERVICE_GLOB,
    COMPILER_SERVICE_TESTS_GLOB
};

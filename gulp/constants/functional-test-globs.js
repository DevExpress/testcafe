const MULTIPLE_WINDOWS_TESTS_GLOB = 'test/functional/fixtures/multiple-windows/test.js';
const COMPILER_SERVICE_TESTS_GLOB = 'test/functional/fixtures/compiler-service/test.js';
const LEGACY_TESTS_GLOB           = 'test/functional/legacy-fixtures/**/test.js';

const TESTS_GLOB = [
    'test/functional/fixtures/**/test.js',
    `!${MULTIPLE_WINDOWS_TESTS_GLOB}`,
    `!${COMPILER_SERVICE_TESTS_GLOB}`
];

const MIGRATE_ALL_TESTS_TO_COMPILER_SERVICE_GLOB = [
    'test/functional/fixtures/app-command/test.js',
    'test/functional/fixtures/driver/test.js',
    'test/functional/fixtures/concurrency/test.js',
    'test/functional/fixtures/driver/test.js',
    'test/functional/fixtures/hammerhead/gh-2418/test.js',
    'test/functional/fixtures/hammerhead/gh-2622/test.js',
    'test/functional/fixtures/live/test.js',
    'test/functional/fixtures/api/es-next/roles/test.js',
    'test/functional/fixtures/api/es-next/hooks/test.js',
    'test/functional/fixtures/api/es-next/request-hooks/test.js'
];

module.exports = {
    TESTS_GLOB,
    LEGACY_TESTS_GLOB,
    MULTIPLE_WINDOWS_TESTS_GLOB,
    MIGRATE_ALL_TESTS_TO_COMPILER_SERVICE_GLOB,
    COMPILER_SERVICE_TESTS_GLOB
};

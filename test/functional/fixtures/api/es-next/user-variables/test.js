const exportableLib = require('../../../../../../lib/api/exportable-lib');

const DEFAULT_SELECTOR_TIMEOUT   = 3000;
const DEFAULT_RUN_OPTIONS        = {
    selectorTimeout: DEFAULT_SELECTOR_TIMEOUT,
};

describe('[API] UserVariables', function () {
    it('Read', function () {
        //It's a temporary hack since sending 'userVariables' in run isn't realized.
        //https://github.com/DevExpress/testcafe/issues/6652
        Object.assign(exportableLib.userVariables, {
            url:             'localhost',
            port:            1337,
            isUserVariables: true,
        });

        return runTests('./testcafe-fixtures/readable-test.js', 'test', DEFAULT_RUN_OPTIONS);
    });
    it('Write', function () {
        return runTests('./testcafe-fixtures/writable-test.js', 'test', DEFAULT_RUN_OPTIONS);
    });
});

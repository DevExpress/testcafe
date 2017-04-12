var tmp  = require('tmp');
var path = require('path');
var copy = require('recursive-copy');

describe('[Regression](GH-637)', function () {
    it("Should let test file locate babel-runtime if it's not installed on global or test file node_modules lookup scope", function () {
        tmp.setGracefulCleanup();

        var tmpDir = tmp.dirSync().name;
        var srcDir = path.join(__dirname, './data');

        return copy(srcDir, tmpDir).then(function () {
            var testFile = path.join(tmpDir, './testfile.js');

            return runTests(testFile, 'Some test', { only: 'chrome' });
        });
    });
});

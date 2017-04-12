var expect     = require('chai').expect;
var isFreePort = require('endpoint-utils').isFreePort;
var delay      = require('../../../../lib/utils/delay');

describe('App command', function () {
    it('Should fail task if app fails', function () {
        return runTests('./testcafe-fixtures/app-command-test.js', 'Wait', {
            shouldFail: true,
            appCommand: 'node test/functional/fixtures/app-command/failing-app.js'
        })
            .catch(function (err) {
                expect(err.message).contains('Tested app failed with an error:\n\nError: Command failed');
            });
    });

    it('Should run app and close it once the tests complete', function () {
        return runTests('./testcafe-fixtures/app-command-test.js', 'Click div', {
            appCommand: 'http-server test/functional/fixtures/app-command/static -p 3026'
        })
            .then(function () {
                return delay(1000);
            })
            .then(function () {
                return isFreePort(3026);
            })
            .then(function (isFree) {
                expect(isFree).to.be.true;
            });
    });
});

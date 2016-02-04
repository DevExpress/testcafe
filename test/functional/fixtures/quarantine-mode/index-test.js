var expect         = require('chai').expect;
var http           = require('http');
var promisifyEvent = require('promisify-event');
var config         = require('../../config');


var TEST_SERVER_PORT               = 3002;
var TEST_SERVER_KEEP_ALIVE_TIMEOUT = 2000;
var BROWSERS_COUNT                 = config.browsers.length;


describe('Quarantine mode tests', function () {
    var expectedBrowsersCount = BROWSERS_COUNT;
    var requestNumber         = 0;
    var responses             = [];
    var serverResponse        = null;

    function requestHandler (request, response) {
        responses.push(response);
        expectedBrowsersCount--;

        if (expectedBrowsersCount > 0)
            return;

        responses.forEach(function (res) {
            res.writeHead(200, {
                'Access-Control-Allow-Origin': '*'
            });

            res.write(serverResponse(requestNumber));

            res.end();
        });

        expectedBrowsersCount = BROWSERS_COUNT;
        responses             = [];
        requestNumber++;
    }

    var testServer = null;

    function startServer () {
        testServer = http.createServer(requestHandler);

        testServer.setTimeout(TEST_SERVER_KEEP_ALIVE_TIMEOUT);
        testServer.listen(TEST_SERVER_PORT);
        return promisifyEvent(testServer, 'listening');
    }

    function closeServer () {
        testServer.close();
        return promisifyEvent(testServer, 'close');
    }

    before(function () {
        return startServer();
    });

    after(function () {
        return closeServer();
    });

    beforeEach(function () {
        expectedBrowsersCount = BROWSERS_COUNT;
        requestNumber         = 0;
        responses             = [];
        serverResponse        = null;
    });

    it('Should pass if an unstable test passes in most of runs', function () {
        serverResponse = function (reqNum) {
            return reqNum === 0 ? 'fail' : 'pass';
        };

        return runTests('index.test.js', 'Wait 200ms', { quarantineMode: true })
            .then(function (err) {
                expect(requestNumber).to.be.at.least(3);
                expect(testReport.unstable).to.be.true;
                expect(err).to.equal('');
            });
    });


    it('Should fail if an unstable test fails in most of runs', function () {
        serverResponse = function (reqNum) {
            return reqNum === 1 ? 'pass' : 'fail';
        };

        return runTests('index.test.js', 'Wait 200ms', { shouldFail: true, quarantineMode: true })
            .catch(function (err) {
                var expectedError = 'Uncaught JavaScript error Uncaught Error: Failed by request! on page';

                expect(requestNumber).to.be.at.least(3);
                expect(testReport.unstable).to.be.true;
                expect(err).contains(expectedError);
            });
    });
});

var path    = require('path');
var Promise = require('pinkie');
var expect  = require('chai').expect;
var config  = require('../../config');


if (config.useLocalBrowsers) {
    describe('Concurrency', function () {
        var data = '';

        function run (browsers, concurrency, file) {
            return testCafe
                .createRunner()
                .src(path.join(__dirname, file))
                .reporter('json', {
                    write: function (newData) {
                        data += newData;
                    },

                    end: function (newData) {
                        data += newData;
                    }
                })
                .browsers(browsers)
                .concurrency(concurrency)
                .run();
        }

        function getResults (testData) {
            return JSON.parse(testData)
                .fixtures[0]
                .tests
                .filter(function (test) {
                    return test.name.toLowerCase() === 'results';
                })[0];
        }

        function createConnections (count) {
            var connections = [];

            function createConnection () {
                return testCafe.createBrowserConnection();
            }

            function addConnection (connection) {
                connections.push(connection);
                return connections;
            }

            var promise = Promise.resolve();

            for (var i = 0; i < count; i++) {
                promise = promise
                    .then(createConnection)
                    .then(addConnection);
            }

            return promise;
        }

        beforeEach(function () {
            data = '';
        });

        it('Should run tests sequentially if concurrency = 1', function () {
            return run('chrome', 1, './testcafe-fixtures/sequential-test.js')
                .then(failedCount => {
                    var results = getResults(data);

                    expect(results.errs).eql([]);
                    expect(failedCount).eql(0);
                });
        });

        it('Should run tests concurrently if concurrency > 1', function () {
            return run('chrome', 2, './testcafe-fixtures/concurrent-test.js')
                .then(failedCount => {
                    var results = getResults(data);

                    expect(results.errs).eql([]);
                    expect(failedCount).eql(0);
                });
        });

        it('Should run tests concurrently in different browser kinds', function () {
            return run(['chrome', 'firefox'], 2, './testcafe-fixtures/multibrowser-concurrent-test.js')
                .then(failedCount => {
                    var results = getResults(data);

                    expect(results.errs).eql([]);
                    expect(failedCount).eql(0);
                });
        });

        it('Should fail if number of remotes is not divisible by concurrency', function () {
            return createConnections(3)
                .then(function (connections) {
                    return run(connections, 2, './testcafe-fixtures/concurrent-test.js');
                })
                .then(function () {
                    throw new Error('Promise rejection expected');
                })
                .catch(function (error) {
                    expect(error.message).eql('The count of remote browsers should be divisible by the factor of concurrency.');
                });
        });
    });
}


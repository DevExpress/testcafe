var path    = require('path');
var Promise = require('pinkie');
var expect  = require('chai').expect;
var config  = require('../../config');


if (config.useLocalBrowsers) {
    describe('Concurrency', function () {
        var data = '';

        function resolvePath (file) {
            return path.join(__dirname, file);
        }

        function run (browsers, concurrency, files, reporter) {
            var src = null;

            reporter = reporter || 'json';

            if (typeof files === 'string')
                src = resolvePath(files);
            else {
                src = files.map(function (file) {
                    return resolvePath(file);
                });
            }

            return testCafe
                .createRunner()
                .src(src)
                .reporter(reporter, {
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

        function customReporter () {
            return {
                reportTestDone: function (name) {
                    this.write('Test ' + name + ' done').newline();
                },

                reportFixtureStart: function (name) {
                    this.write('Fixture ' + name + ' started').newline();
                },

                reportTaskStart: function () {

                },

                reportTaskDone: function () {

                }
            };
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

        it('Should report fixture start correctly if second fixture finishes before first', function () {
            return run('chrome', 2, ['./testcafe-fixtures/multifixture-test-a.js', './testcafe-fixtures/multifixture-test-b.js'], customReporter)
                .then(failedCount => {
                    expect(failedCount).eql(0);
                    expect(data.split('\n')).eql([
                        'Fixture Multifixture A started',
                        'Test Long test done',
                        'Fixture Multifixture B started',
                        'Test Short test done',
                        ''
                    ]);
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
                    expect(error.message).eql('The number of remote browsers should be divisible by the factor of concurrency.');
                });
        });
    });
}


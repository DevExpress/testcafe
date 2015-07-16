var expect       = require('chai').expect;
var EventEmitter = require('events').EventEmitter;
var util         = require('util');
var Promise      = require('promise');
var reporters    = require('../../lib/reporters');
var readFile     = require('../../lib/utils/read-file-relative');

describe('Reporters', function () {
    // Runnable configuration mocks
    var browserConnectionMocks = [
        { userAgent: 'Chrome' },
        { userAgent: 'Firefox' }
    ];

    var fixtureMocks = [
        {
            name: 'fixture1',
            path: './fixture1.js'
        },
        {
            name: 'fixture2',
            path: './fixture2.js'
        },
        {
            name: 'fixture3',
            path: './fixture3.js'
        }
    ];

    var testMocks = [
        {
            name:    'fixture1test1',
            fixture: fixtureMocks[0]
        },
        {
            name:    'fixture1test2',
            fixture: fixtureMocks[0]
        },
        {
            name:    'fixture1test3',
            fixture: fixtureMocks[0]
        },
        {
            name:    'fixture2test1',
            fixture: fixtureMocks[1]
        },
        {
            name:    'fixture2test2',
            fixture: fixtureMocks[1]
        },
        {
            name:    'fixture3test1',
            fixture: fixtureMocks[2]
        }
    ];


    // Test run mocks
    var chromeTestRunMocks = [
        //fixture1test1
        {
            test:              testMocks[0],
            unstable:          true,
            browserConnection: browserConnectionMocks[0],
            errs:              []
        },

        //fixture1test2
        {
            test:              testMocks[1],
            unstable:          false,
            browserConnection: browserConnectionMocks[0],

            errs: [
                'Error1: Lorem ipsum dolor sit amet, consectetur adipiscing elit',

                'Error2: Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut ' +
                'aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate ' +
                'velit esse cillum dolore eu fugiat nulla pariatur.'
            ]
        },

        //fixture1test3
        {
            test:              testMocks[2],
            unstable:          false,
            browserConnection: browserConnectionMocks[0],
            errs:              []

        },

        //fixture2test1
        {
            test:              testMocks[3],
            unstable:          false,
            browserConnection: browserConnectionMocks[0],
            errs:              []
        },

        //fixture2test2
        {
            test:              testMocks[4],
            unstable:          false,
            browserConnection: browserConnectionMocks[0],
            errs:              []
        },

        //fixture3test1
        {
            test:              testMocks[5],
            unstable:          false,
            browserConnection: browserConnectionMocks[0],
            errs:              []
        }
    ];


    var firefoxTestRunMocks = [
        //fixture1test1
        {
            test:              testMocks[0],
            unstable:          true,
            browserConnection: browserConnectionMocks[1],
            errs:              []
        },

        // 'fixture1test2
        {
            test:              testMocks[1],
            unstable:          false,
            browserConnection: browserConnectionMocks[1],

            errs: [
                'Error3: Excepteur sint occaecat cupidatat non proident, ' +
                'sunt in culpa qui officia deserunt mollit anim id est laborum &.'
            ]
        },

        //fixture1test3
        {
            test:              testMocks[2],
            unstable:          false,
            browserConnection: browserConnectionMocks[1],
            errs:              []
        },

        //fixture2test1
        {
            test:              testMocks[3],
            unstable:          false,
            browserConnection: browserConnectionMocks[1],
            errs:              []
        },

        //fixture2test2
        {
            test:              testMocks[4],
            unstable:          false,
            browserConnection: browserConnectionMocks[1],
            errs:              []
        },

        //fixture3test1
        {
            test:              testMocks[5],
            unstable:          true,
            browserConnection: browserConnectionMocks[1],

            errs: [
                'Error1: Lorem ipsum dolor sit amet, consectetur adipiscing elit, ' +
                'sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
            ]
        }
    ];


    // Task mock
    var TaskMock = function () {
        EventEmitter.call(this);

        this.tests              = testMocks;
        this.browserConnections = browserConnectionMocks;
    };

    util.inherits(TaskMock, EventEmitter);


    // Output stream and formatter mocks
    function createOutStreamMock () {
        return {
            data:      '',
            endCalled: false,

            write: function (text) {
                if (this.endCalled)
                    throw new Error('Can not write() after end()');

                this.data += text;
            },

            end: function (text) {
                this.write(text);
                this.endCalled = true;
            }
        };
    }

    function formatterMock (err, userAgent) {
        return userAgent + ' - ' + err;
    }


    // Browser job emulation
    function delay () {
        var MIN      = 0;
        var MAX      = 10;
        var duration = Math.floor(Math.random() * (MAX - MIN + 1)) + MIN;

        return new Promise(function (resolve) {
            setTimeout(resolve, duration);
        });
    }

    function emulateBrowserJob (taskMock, testRunMocks) {
        return testRunMocks.reduce(function (chain, testRun) {
            return chain
                .then(function () {
                    taskMock.emit('test-run-start', testRun);
                })
                .then(delay)
                .then(function () {
                    taskMock.emit('test-run-done', testRun);
                })
                .then(delay);
        }, delay());
    }


    // Sanitize string for comparison
    function sanitize (report) {
        return report
            .replace(/\r\n/g, '\n')
            .trim();
    }


    // Test routine
    function testReporter (reporterAlias, done) {
        var taskMock       = new TaskMock();
        var outStreamMock  = createOutStreamMock();
        var Reporter       = reporters[reporterAlias];
        var reporter       = new Reporter(taskMock, outStreamMock, formatterMock);
        var expectedReport = readFile('./data/expected-reports/' + reporterAlias);

        // NOTE: replace dates in reporting routines with the fixed values for the testing purposes
        var origReportTaskStart = reporter._reportTaskStart;
        var origReportTestDone  = reporter._reportTestDone;
        var origReportTaskDone  = reporter._reportTaskDone;

        reporter._reportTaskStart = function (startTime, userAgents) {
            expect(startTime).to.be.a('date');
            origReportTaskStart.call(this, new Date('Thu Jan 01 1970 00:00:00 UTC'), userAgents);
        };

        reporter._reportTestDone = function (name, errMsgs, durationMs, unstable) {
            expect(durationMs).to.be.a('number');
            origReportTestDone.call(this, name, errMsgs, 74000, unstable);
        };

        reporter._reportTaskDone = function (passed, total, endTime) {
            expect(endTime).to.be.a('date');
            origReportTaskDone.call(this, passed, total, new Date('Thu Jan 01 1970 00:15:25 UTC'));
        };

        // NOTE: force reporter symbols
        reporter.symbols = { ok: '✓', err: '✖' };

        taskMock.emit('start');

        Promise
            .all([
                emulateBrowserJob(taskMock, chromeTestRunMocks),
                emulateBrowserJob(taskMock, firefoxTestRunMocks)
            ])
            .then(function () {
                taskMock.emit('done');

                expect(sanitize(outStreamMock.data)).eql(sanitize(expectedReport));
                expect(outStreamMock.endCalled).to.be.true;

                done();
            })
            .catch(done);
    }


    // Tests
    it('spec', function (done) {
        testReporter('spec', done);
    });

    it('list', function (done) {
        testReporter('list', done);
    });

    it('minimal', function (done) {
        testReporter('minimal', done);
    });

    it('json', function (done) {
        testReporter('json', done);
    });

    it('xunit', function (done) {
        testReporter('xunit', done);
    });
});

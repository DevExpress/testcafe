var expect       = require('chai').expect;
var EventEmitter = require('events').EventEmitter;
var util         = require('util');
var Promise      = require('pinkie');
var chunk        = require('lodash').chunk;
var Reporter     = require('../../lib/reporter');


describe('Reporter', function () {
    // Runnable configuration mocks
    var screenshotDir = '/screenshots/1445437598847';

    var browserConnectionMocks = [
        { userAgent: 'Chrome' },
        { userAgent: 'Firefox' }
    ];

    var fixtureMocks = [
        {
            name: 'fixture1',
            path: './file1.js',
            meta: {
                run: 'run-001'
            }
        },
        {
            name: 'fixture2',
            path: './file1.js',
            meta: {
                run: 'run-002'
            }
        },
        {
            name: 'fixture3',
            path: './file2.js',
            meta: null
        }
    ];

    var testMocks = [
        {
            name:               'fixture1test1',
            fixture:            fixtureMocks[0],
            skip:               false,
            screenshotExpected: true,
            meta:               {
                run: 'run-001'
            }
        },
        {
            name:               'fixture1test2',
            fixture:            fixtureMocks[0],
            skip:               false,
            screenshotExpected: true,
            meta:               {
                run: 'run-001'
            }
        },
        {
            name:    'fixture1test3',
            skip:    false,
            fixture: fixtureMocks[0],
            meta:    {
                run: 'run-001'
            }
        },
        {
            name:    'fixture2test1',
            skip:    false,
            fixture: fixtureMocks[1],
            meta:    {
                run: 'run-001'
            }
        },
        {
            name:    'fixture2test2',
            skip:    false,
            fixture: fixtureMocks[1],
            meta:    {
                run: 'run-001'
            }
        },
        {
            name:    'fixture3test1',
            skip:    false,
            fixture: fixtureMocks[2],
            meta:    {
                run: 'run-001'
            }
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
                { text: 'err1' },
                { text: 'err2' }
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

            errs: [{ text: 'err1' }]
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
            errs:              [{ text: 'err1' }]
        }
    ];

    chromeTestRunMocks.concat(firefoxTestRunMocks).forEach(function (testRunMock) {
        testRunMock.errs.forEach(function (err) {
            err.userAgent = testRunMock.browserConnection.userAgent;
        });
    });

    var ScreenshotsMock = function () {
        this.hasCapturedFor = function (testMock) {
            return testMock.screenshotExpected;
        };

        this.getPathFor = function () {
            return screenshotDir;
        };
    };


    // Task mock
    var TaskMock = function () {
        EventEmitter.call(this);

        this.tests       = testMocks;
        this.browserConnectionGroups = chunk(browserConnectionMocks, 1);
        this.screenshots = new ScreenshotsMock();

        this.warningLog = {
            messages: [
                'warning1',
                'warning2'
            ]
        };
    };

    util.inherits(TaskMock, EventEmitter);

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

    it('Should analyze task progress and call appropriate plugin methods', function () {
        var taskMock = new TaskMock();

        var expectedCalls = [
            {
                method: 'reportTaskStart',
                args:   [
                    new Date('1970-01-01T00:00:00.000Z'),
                    [
                        'Chrome',
                        'Firefox'
                    ],
                    6
                ]
            },
            {
                method: 'reportFixtureStart',
                args:   [
                    'fixture1',
                    './file1.js',
                    {
                        run: 'run-001'
                    }
                ]
            },
            {
                method: 'reportTestDone',
                args:   [
                    'fixture1test1',
                    {
                        errs:           [],
                        durationMs:     74000,
                        unstable:       true,
                        skipped:        false,
                        screenshotPath: '/screenshots/1445437598847'
                    },
                    {
                        run: 'run-001'
                    }
                ]
            },
            {
                method: 'reportTestDone',
                args:   [
                    'fixture1test2',
                    {
                        errs: [
                            {
                                text:      'err1',
                                userAgent: 'Chrome'
                            },
                            {
                                text:      'err2',
                                userAgent: 'Chrome'
                            },
                            {
                                text:      'err1',
                                userAgent: 'Firefox'
                            }
                        ],

                        durationMs:     74000,
                        unstable:       false,
                        skipped:        false,
                        screenshotPath: '/screenshots/1445437598847'
                    },
                    {
                        run: 'run-001'
                    }
                ]
            },
            {
                method: 'reportTestDone',
                args:   [
                    'fixture1test3',
                    {
                        errs:           [],
                        durationMs:     74000,
                        unstable:       false,
                        skipped:        false,
                        screenshotPath: null
                    },
                    {
                        run: 'run-001'
                    }
                ]
            },
            {
                method: 'reportFixtureStart',
                args:   [
                    'fixture2',
                    './file1.js',
                    {
                        run: 'run-002'
                    }
                ]
            },
            {
                method: 'reportTestDone',
                args:   [
                    'fixture2test1',
                    {
                        errs:           [],
                        durationMs:     74000,
                        unstable:       false,
                        skipped:        false,
                        screenshotPath: null
                    },
                    {
                        run: 'run-001'
                    }
                ]
            },
            {
                method: 'reportTestDone',
                args:   [
                    'fixture2test2',
                    {
                        errs:           [],
                        durationMs:     74000,
                        unstable:       false,
                        skipped:        false,
                        screenshotPath: null
                    },
                    {
                        run: 'run-001'
                    }
                ]
            },
            {
                method: 'reportFixtureStart',
                args:   [
                    'fixture3',
                    './file2.js',
                    null
                ]
            },
            {
                method: 'reportTestDone',
                args:   [
                    'fixture3test1',
                    {
                        errs: [
                            {
                                text:      'err1',
                                userAgent: 'Firefox'
                            }
                        ],

                        durationMs:     74000,
                        unstable:       true,
                        skipped:        false,
                        screenshotPath: null
                    },
                    {
                        run: 'run-001'
                    }
                ]
            },
            {
                method: 'reportTaskDone',
                args:   [
                    new Date('1970-01-01T00:15:25.000Z'),
                    4,
                    ['warning1', 'warning2']
                ]
            }
        ];

        var reporter = new Reporter({
            calls: [],

            reportTaskStart: function () {
                var args = Array.prototype.slice.call(arguments);

                expect(args[0]).to.be.a('date');

                // NOTE: replace startTime
                args[0] = new Date('Thu Jan 01 1970 00:00:00 UTC');

                this.calls.push({ method: 'reportTaskStart', args: args });
            },

            reportFixtureStart: function () {
                this.calls.push({ method: 'reportFixtureStart', args: Array.prototype.slice.call(arguments) });
            },

            reportTestDone: function () {
                var args = Array.prototype.slice.call(arguments);

                expect(args[1].durationMs).to.be.an('number');

                // NOTE: replace durationMs
                args[1].durationMs = 74000;

                this.calls.push({ method: 'reportTestDone', args: args });
            },

            reportTaskDone: function () {
                var args = Array.prototype.slice.call(arguments);

                expect(args[0]).to.be.a('date');

                // NOTE: replace endTime
                args[0] = new Date('Thu Jan 01 1970 00:15:25 UTC');

                this.calls.push({ method: 'reportTaskDone', args: args });
            }
        }, taskMock);

        taskMock.emit('start');

        return Promise
            .all([
                emulateBrowserJob(taskMock, chromeTestRunMocks),
                emulateBrowserJob(taskMock, firefoxTestRunMocks)
            ])
            .then(function () {
                taskMock.emit('done');

                expect(reporter.plugin.calls).eql(expectedCalls);
            });
    });

    it('Should disable colors if plugin has "noColors" flag', function () {
        var taskMock = new TaskMock();
        var reporter = new Reporter({ noColors: true }, taskMock);

        expect(reporter.plugin.chalk.enabled).to.be.false;
    });
});

const { expect }        = require('chai');
const { chunk, random } = require('lodash');
const Reporter          = require('../../lib/reporter');
const Task              = require('../../lib/runner/task');
const Videos            = require('../../lib/video-recorder/videos');
const delay             = require('../../lib/utils/delay');

describe('Reporter', () => {
    // Runnable configuration mocks
    const screenshotDir = '/screenshots/1445437598847';

    const browserConnectionMocks = [
        { userAgent: 'Chrome' },
        { userAgent: 'Firefox' }
    ];

    const fixtureMocks = [
        {
            id:   'fid1',
            name: 'fixture1',
            path: './file1.js',
            meta: {
                run: 'run-001'
            }
        },
        {
            id:   'fid2',
            name: 'fixture2',
            path: './file1.js',
            meta: {
                run: 'run-002'
            }
        },
        {
            id:   'fid3',
            name: 'fixture3',
            path: './file2.js',
            meta: null
        }
    ];

    const testMocks = [
        {
            id:          'idf1t1',
            name:        'fixture1test1',
            pageUrl:     'urlf1t1',
            fixture:     fixtureMocks[0],
            skip:        false,
            screenshots: [{
                testRunId:         'idf1t1-1',
                screenshotPath:    'screenshot1.png',
                thumbnailPath:     'thumbnail1.png',
                userAgent:         'chrome',
                takenOnFail:       false,
                quarantineAttempt: 2
            }],
            clientScripts: [],
            meta:          {
                run: 'run-001'
            }
        },
        {
            id:          'idf1t2',
            name:        'fixture1test2',
            pageUrl:     'urlf1t2',
            fixture:     fixtureMocks[0],
            skip:        false,
            screenshots: [{
                testRunId:         'idf1t2-1',
                screenshotPath:    'screenshot1.png',
                thumbnailPath:     'thumbnail1.png',
                userAgent:         'chrome',
                takenOnFail:       false,
                quarantineAttempt: null
            }, {
                testRunId:         'idf1t2-2',
                screenshotPath:    'screenshot2.png',
                thumbnailPath:     'thumbnail2.png',
                userAgent:         'chrome',
                takenOnFail:       true,
                quarantineAttempt: null
            }],
            clientScripts: [],
            meta:          {
                run: 'run-001'
            }
        },
        {
            id:            'idf1t3',
            name:          'fixture1test3',
            pageUrl:       'urlf1t3',
            skip:          false,
            fixture:       fixtureMocks[0],
            clientScripts: [],
            meta:          {
                run: 'run-001'
            }
        },
        {
            id:            'idf2t1',
            name:          'fixture2test1',
            pageUrl:       'urlf2t1',
            skip:          false,
            fixture:       fixtureMocks[1],
            clientScripts: [],
            meta:          {
                run: 'run-001'
            }
        },
        {
            id:            'idf2t2',
            name:          'fixture2test2',
            pageUrl:       'urlf2t2',
            skip:          false,
            fixture:       fixtureMocks[1],
            clientScripts: [],
            meta:          {
                run: 'run-001'
            }
        },
        {
            id:            'idf3t1',
            name:          'fixture3test1',
            pageUrl:       'urlf3t1',
            skip:          false,
            fixture:       fixtureMocks[2],
            clientScripts: [],
            meta:          {
                run: 'run-001'
            }
        },
        {
            id:            'idf3t2',
            name:          'fixture3test2',
            pageUrl:       'urlf3t2',
            skip:          true,
            fixture:       fixtureMocks[2],
            clientScripts: [],
            meta:          {
                run: 'run-001'
            }
        },
        {
            id:            'idf3t3',
            name:          'fixture3test3',
            pageUrl:       'urlf3t3',
            skip:          false,
            fixture:       fixtureMocks[2],
            clientScripts: [],
            meta:          {
                run: 'run-001'
            }
        }
    ];

    // Test run mocks
    const chromeTestRunMocks = [
        //fixture1test1
        {
            id:                'f1t1',
            test:              testMocks[0],
            unstable:          true,
            browserConnection: browserConnectionMocks[0],
            errs:              [],
            warningLog:        { messages: [] },
            quarantine:        {
                attempts: [['1', '2'], []]
            }
        },

        //fixture1test2
        {
            id:                'f1t2',
            test:              testMocks[1],
            unstable:          false,
            browserConnection: browserConnectionMocks[0],
            warningLog:        { messages: [] },

            errs: [
                { text: 'err1' },
                { text: 'err2' }
            ]
        },

        //fixture1test3
        {
            id:                'f1t3',
            test:              testMocks[2],
            unstable:          false,
            browserConnection: browserConnectionMocks[0],
            errs:              [],
            warningLog:        { messages: [] },
        },

        //fixture2test1
        {
            id:                'f2t1',
            test:              testMocks[3],
            unstable:          false,
            browserConnection: browserConnectionMocks[0],
            errs:              [],
            warningLog:        { messages: [] },
        },

        //fixture2test2
        {
            id:                'f2t2',
            test:              testMocks[4],
            unstable:          false,
            browserConnection: browserConnectionMocks[0],
            errs:              [],
            warningLog:        { messages: [] },
        },

        //fixture3test1
        {
            id:                'f3t1',
            test:              testMocks[5],
            unstable:          false,
            browserConnection: browserConnectionMocks[0],
            errs:              [],
            warningLog:        { messages: [] },
        },

        //fixture3test2
        {
            id:                'f3t2',
            test:              testMocks[6],
            unstable:          true,
            browserConnection: browserConnectionMocks[1],
            errs:              [],
            warningLog:        { messages: [] },
        },

        //fixture3test3
        {
            id:                'f3t3',
            test:              testMocks[7],
            unstable:          true,
            browserConnection: browserConnectionMocks[1],
            errs:              [],
            warningLog:        { messages: ['warning2'] }
        }
    ];

    const firefoxTestRunMocks = [
        //fixture1test1
        {
            id:                'f1t1',
            test:              testMocks[0],
            unstable:          true,
            browserConnection: browserConnectionMocks[1],
            errs:              [],
            warningLog:        { messages: [] },
            quarantine:        {
                attempts: [['1', '2'], []]
            }
        },

        // 'fixture1test2
        {
            id:                'f1t2',
            test:              testMocks[1],
            unstable:          false,
            browserConnection: browserConnectionMocks[1],
            errs:              [{ text: 'err1' }],
            warningLog:        { messages: [] }
        },

        //fixture1test3
        {
            id:                'f1t3',
            test:              testMocks[2],
            unstable:          false,
            browserConnection: browserConnectionMocks[1],
            errs:              [],
            warningLog:        { messages: [] }
        },

        //fixture2test1
        {
            id:                'f2t1',
            test:              testMocks[3],
            unstable:          false,
            browserConnection: browserConnectionMocks[1],
            errs:              [],
            warningLog:        { messages: [] }
        },

        //fixture2test2
        {
            id:                'f2t2',
            test:              testMocks[4],
            unstable:          false,
            browserConnection: browserConnectionMocks[1],
            errs:              [],
            warningLog:        { messages: [] }
        },

        //fixture3test1
        {
            id:                'f3t1',
            test:              testMocks[5],
            unstable:          true,
            browserConnection: browserConnectionMocks[1],
            errs:              [{ text: 'err1' }],
            warningLog:        { messages: ['warning1'] }
        },

        //fixture3test2
        {
            id:                'f3t2',
            test:              testMocks[6],
            unstable:          true,
            browserConnection: browserConnectionMocks[1],
            errs:              [],
            warningLog:        { messages: [] }
        },

        //fixture3test3
        {
            id:                'f3t3',
            test:              testMocks[7],
            unstable:          true,
            browserConnection: browserConnectionMocks[1],
            errs:              [],
            warningLog:        { messages: ['warning2', 'warning3'] }
        }
    ];

    chromeTestRunMocks.concat(firefoxTestRunMocks).forEach(testRunMock => {
        testRunMock.errs.forEach(err => {
            err.userAgent = testRunMock.browserConnection.userAgent;
        });
    });

    class ScreenshotsMock {
        constructor () {}

        getScreenshotsInfo (testMock) {
            return testMock.screenshots;
        }

        hasCapturedFor (testMock) {
            return this.getScreenshotsInfo(testMock);
        }

        getPathFor () {
            return screenshotDir;
        }
    }

    class VideosMock extends Videos {
        constructor (testVideoInfos) {
            super([], { videoPath: '' });


            this.testVideoInfos = testVideoInfos;
        }
    }

    const taskOptions = {
        allowMultipleWindows:   false,
        appInitDelay:           1000,
        assertionTimeout:       3000,
        browsers:               ['chrome', 'firefox'],
        concurrency:            1,
        debugMode:              false,
        debugOnFail:            false,
        developmentMode:        false,
        disablePageCaching:     false,
        disablePageReloads:     false,
        disableScreenshots:     false,
        hostname:               'localhost',
        pageLoadTimeout:        3000,
        port1:                  1337,
        port2:                  1338,
        quarantineMode:         false,
        reporter:               [{ name: 'customReporter' }],
        retryTestPages:         false,
        screenshots:            { path: '/path/to/screenshots' },
        selectorTimeout:        10000,
        skipJsErrors:           false,
        skipUncaughtErrors:     false,
        speed:                  1,
        src:                    ['test.js'],
        stopOnFirstFail:        false,
        takeScreenshotsOnFails: false
    };

    class TaskMock extends Task {
        constructor () {
            super(testMocks, chunk(browserConnectionMocks, 1), {}, taskOptions);

            this.screenshots = new ScreenshotsMock();

            this.warningLog = {
                messages: [
                    'warning1',
                    'warning2',
                    'warning3'
                ]
            };
        }

        _createBrowserJobs () {
            return [];
        }
    }

    let log = [];

    // Browser job emulation
    function randomDelay () {
        return delay(random(100, 500));
    }

    function emulateBrowserJob (taskMock, testRunMocks) {
        return testRunMocks.reduce((chain, testRun) => {
            return chain
                .then(() => taskMock.emit('test-run-start', testRun))
                .then(() => log.push('test-run-start resolved'))
                .then(randomDelay)
                .then(() => taskMock.emit('test-run-done', testRun))
                .then(() => log.push('test-run-done resolved'))
                .then(randomDelay);
        }, randomDelay());
    }

    beforeEach(() => {
        log = [];
    });

    it('Should analyze task progress and call appropriate plugin methods', function () {
        this.timeout(30000);

        const taskMock = new TaskMock();

        function createReporter () {
            return new Reporter({
                reportTaskStart: function (...args) {
                    expect(args[0]).to.be.a('date');

                    // NOTE: replace startTime
                    args[0] = new Date('Thu Jan 01 1970 00:00:00 UTC');

                    return delay(1000)
                        .then(() => log.push({ method: 'reportTaskStart', args: args }));
                },

                reportFixtureStart: function () {
                    return delay(1000)
                        .then(() => log.push({ method: 'reportFixtureStart', args: Array.prototype.slice.call(arguments) }));
                },

                reportTestStart: function (...args) {
                    expect(args[0]).to.be.an('string');

                    return delay(1000)
                        .then(() => log.push({ method: 'reportTestStart', args: args }));
                },

                reportTestDone: function (...args) {
                    expect(args[1].durationMs).to.be.an('number');

                    // NOTE: replace durationMs
                    args[1].durationMs = 74000;

                    return delay(1000)
                        .then(() => log.push({ method: 'reportTestDone', args: args }));
                },

                reportTaskDone: function (...args) {
                    expect(args[0]).to.be.a('date');

                    // NOTE: replace endTime
                    args[0] = new Date('Thu Jan 01 1970 00:15:25 UTC');

                    return delay(1000)
                        .then(() => log.push({ method: 'reportTaskDone', args: args }));
                }
            }, taskMock);
        }

        const expectedLog = [
            {
                method: 'reportTaskStart',
                args:   [
                    new Date('1970-01-01T00:00:00.000Z'),
                    [
                        'Chrome',
                        'Firefox'
                    ],
                    7,
                    [
                        {
                            fixture: {
                                id:    'fid1',
                                name:  'fixture1',
                                tests: [
                                    {
                                        id:   'idf1t1',
                                        name: 'fixture1test1',
                                        skip: false
                                    },
                                    {
                                        id:   'idf1t2',
                                        name: 'fixture1test2',
                                        skip: false,
                                    },
                                    {
                                        id:   'idf1t3',
                                        name: 'fixture1test3',
                                        skip: false
                                    }
                                ]
                            }
                        },
                        {
                            fixture: {
                                id:    'fid2',
                                name:  'fixture2',
                                tests: [
                                    {
                                        id:   'idf2t1',
                                        name: 'fixture2test1',
                                        skip: false
                                    },
                                    {
                                        id:   'idf2t2',
                                        name: 'fixture2test2',
                                        skip: false
                                    }
                                ]
                            },
                        },
                        {
                            fixture: {
                                id:    'fid3',
                                name:  'fixture3',
                                tests: [
                                    {
                                        id:   'idf3t1',
                                        name: 'fixture3test1',
                                        skip: false
                                    },
                                    {
                                        id:   'idf3t2',
                                        name: 'fixture3test2',
                                        skip: true
                                    },
                                    {
                                        id:   'idf3t3',
                                        name: 'fixture3test3',
                                        skip: false
                                    }
                                ]
                            }
                        }
                    ],
                    // NOTE: task properties
                    {
                        configuration: {
                            allowMultipleWindows:   false,
                            appInitDelay:           1000,
                            assertionTimeout:       3000,
                            browsers:               ['chrome', 'firefox'],
                            concurrency:            1,
                            debugMode:              false,
                            debugOnFail:            false,
                            developmentMode:        false,
                            disablePageCaching:     false,
                            disablePageReloads:     false,
                            disableScreenshots:     false,
                            hostname:               'localhost',
                            pageLoadTimeout:        3000,
                            port1:                  1337,
                            port2:                  1338,
                            quarantineMode:         false,
                            reporter:               [{ name: 'customReporter' }],
                            retryTestPages:         false,
                            screenshots:            { path: '/path/to/screenshots' },
                            selectorTimeout:        10000,
                            skipJsErrors:           false,
                            skipUncaughtErrors:     false,
                            speed:                  1,
                            src:                    ['test.js'],
                            stopOnFirstFail:        false,
                            takeScreenshotsOnFails: false
                        }
                    }
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
            'task-start resolved',
            {
                method: 'reportTestStart',
                args:   [
                    'fixture1test1',
                    {
                        run: 'run-001'
                    },
                    {
                        testRunIds: [
                            'f1t1',
                            'f1t1'
                        ]
                    }
                ]
            },
            'test-run-start resolved',
            'test-run-start resolved',
            {
                method: 'reportTestDone',
                args:   [
                    'fixture1test1',
                    {
                        errs:       [],
                        warnings:   [],
                        durationMs: 74000,
                        unstable:   true,
                        skipped:    false,
                        quarantine: {
                            1: { passed: false },
                            2: { passed: true }
                        },
                        screenshotPath: '/screenshots/1445437598847',
                        screenshots:    [{
                            testRunId:         'idf1t1-1',
                            screenshotPath:    'screenshot1.png',
                            thumbnailPath:     'thumbnail1.png',
                            userAgent:         'chrome',
                            takenOnFail:       false,
                            quarantineAttempt: 2
                        }],
                        videos: []
                    },
                    {
                        run: 'run-001'
                    }
                ]
            },
            'test-run-done resolved',
            'test-run-done resolved',
            {
                method: 'reportTestStart',
                args:   [
                    'fixture1test2',
                    {
                        run: 'run-001'
                    },
                    {
                        testRunIds: [
                            'f1t2',
                            'f1t2'
                        ]
                    }
                ]
            },
            'test-run-start resolved',
            'test-run-start resolved',
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

                        warnings:       [],
                        durationMs:     74000,
                        unstable:       false,
                        skipped:        false,
                        quarantine:     null,
                        screenshotPath: '/screenshots/1445437598847',
                        screenshots:    [{
                            testRunId:         'idf1t2-1',
                            screenshotPath:    'screenshot1.png',
                            thumbnailPath:     'thumbnail1.png',
                            userAgent:         'chrome',
                            takenOnFail:       false,
                            quarantineAttempt: null
                        }, {
                            testRunId:         'idf1t2-2',
                            screenshotPath:    'screenshot2.png',
                            thumbnailPath:     'thumbnail2.png',
                            userAgent:         'chrome',
                            takenOnFail:       true,
                            quarantineAttempt: null
                        }],
                        videos: []
                    },
                    {
                        run: 'run-001'
                    }
                ]
            },
            'test-run-done resolved',
            'test-run-done resolved',
            {
                method: 'reportTestStart',
                args:   [
                    'fixture1test3',
                    {
                        run: 'run-001'
                    },
                    {
                        testRunIds: [
                            'f1t3',
                            'f1t3'
                        ]
                    }
                ]
            },
            'test-run-start resolved',
            'test-run-start resolved',
            {
                method: 'reportTestDone',
                args:   [
                    'fixture1test3',
                    {
                        errs:           [],
                        warnings:       [],
                        durationMs:     74000,
                        unstable:       false,
                        skipped:        false,
                        quarantine:     null,
                        screenshotPath: null,
                        screenshots:    [],
                        videos:         []
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
            'test-run-done resolved',
            'test-run-done resolved',
            {
                method: 'reportTestStart',
                args:   [
                    'fixture2test1',
                    {
                        run: 'run-001'
                    },
                    {
                        testRunIds: [
                            'f2t1',
                            'f2t1'
                        ]
                    }
                ]
            },
            'test-run-start resolved',
            'test-run-start resolved',
            {
                method: 'reportTestDone',
                args:   [
                    'fixture2test1',
                    {
                        errs:           [],
                        warnings:       [],
                        durationMs:     74000,
                        unstable:       false,
                        skipped:        false,
                        quarantine:     null,
                        screenshotPath: null,
                        screenshots:    [],
                        videos:         []
                    },
                    {
                        run: 'run-001'
                    }
                ]
            },
            'test-run-done resolved',
            'test-run-done resolved',
            {
                method: 'reportTestStart',
                args:   [
                    'fixture2test2',
                    {
                        run: 'run-001'
                    },
                    {
                        testRunIds: [
                            'f2t2',
                            'f2t2'
                        ]
                    }
                ]
            },
            'test-run-start resolved',
            'test-run-start resolved',
            {
                method: 'reportTestDone',
                args:   [
                    'fixture2test2',
                    {
                        errs:           [],
                        warnings:       [],
                        durationMs:     74000,
                        unstable:       false,
                        skipped:        false,
                        quarantine:     null,
                        screenshotPath: null,
                        screenshots:    [],
                        videos:         []
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
            'test-run-done resolved',
            'test-run-done resolved',
            {
                method: 'reportTestStart',
                args:   [
                    'fixture3test1',
                    {
                        run: 'run-001'
                    },
                    {
                        testRunIds: [
                            'f3t1',
                            'f3t1'
                        ]
                    }
                ]
            },
            'test-run-start resolved',
            'test-run-start resolved',
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

                        warnings:       ['warning1'],
                        durationMs:     74000,
                        unstable:       true,
                        skipped:        false,
                        quarantine:     null,
                        screenshotPath: null,
                        screenshots:    [],
                        videos:         []
                    },
                    {
                        run: 'run-001'
                    }
                ]
            },
            'test-run-done resolved',
            'test-run-done resolved',
            {
                method: 'reportTestStart',
                args:   [
                    'fixture3test2',
                    {
                        run: 'run-001'
                    },
                    {
                        testRunIds: [
                            'f3t2',
                            'f3t2'
                        ]
                    }
                ]
            },
            'test-run-start resolved',
            'test-run-start resolved',
            {
                method: 'reportTestDone',
                args:   [
                    'fixture3test2',
                    {
                        errs:           [],
                        warnings:       [],
                        durationMs:     74000,
                        unstable:       true,
                        skipped:        true,
                        quarantine:     null,
                        screenshotPath: null,
                        screenshots:    [],
                        videos:         []
                    },
                    {
                        run: 'run-001'
                    }
                ]
            },
            'test-run-done resolved',
            'test-run-done resolved',
            {
                method: 'reportTestStart',
                args:   [
                    'fixture3test3',
                    {
                        run: 'run-001'
                    },
                    {
                        testRunIds: [
                            'f3t3',
                            'f3t3'
                        ]
                    }
                ]
            },
            'test-run-start resolved',
            'test-run-start resolved',
            {
                method: 'reportTestDone',
                args:   [
                    'fixture3test3',
                    {
                        errs:           [],
                        warnings:       ['warning2', 'warning3'],
                        durationMs:     74000,
                        unstable:       true,
                        skipped:        false,
                        quarantine:     null,
                        screenshotPath: null,
                        screenshots:    [],
                        videos:         []
                    },
                    {
                        run: 'run-001'
                    }
                ]
            },
            'test-run-done resolved',
            'test-run-done resolved',
            {
                method: 'reportTaskDone',
                args:   [
                    new Date('1970-01-01T00:15:25.000Z'),
                    5,
                    ['warning1', 'warning2', 'warning3'],
                    { passedCount: 5, failedCount: 2, skippedCount: 1 }
                ]
            },
            'task-done resolved'
        ];

        createReporter(taskMock);

        return taskMock
            .emit('start')
            .then(() => {
                log.push('task-start resolved');
                return Promise.all([
                    emulateBrowserJob(taskMock, chromeTestRunMocks),
                    emulateBrowserJob(taskMock, firefoxTestRunMocks)
                ]);
            })
            .then(() => taskMock.emit('done'))
            .then(() => {
                log.push('task-done resolved');

                expect(log).eql(expectedLog);
            });
    });

    it('Should disable colors if plugin has "noColors" flag', () => {
        const taskMock = new TaskMock();
        const reporter = new Reporter({ noColors: true }, taskMock);

        expect(reporter.plugin.chalk.enabled).to.be.false;
    });

    it('Should provide videos info to the reporter', () => {
        const videoLog = [];
        const taskMock = new TaskMock();

        taskMock.videos = new VideosMock({
            'idf1t1': {
                recordings: [{
                    testRunId: 'f1t1-id1',
                    videoPath: 'f1t1-path1'
                }, {
                    testRunId: 'f1t1-id2',
                    videoPath: 'f1t1-path2'
                }]
            },
            'idf1t2': {
                recordings: [{
                    testRunId: 'f1t2-id1',
                    videoPath: 'f1t2-path1'
                }, {
                    testRunId: 'f1t2-id2',
                    videoPath: 'f1t2-path2'
                }]
            }
        });

        function createReporter () {
            return new Reporter({
                reportTaskStart: function () {
                },
                reportTaskDone: function () {
                },
                reportFixtureStart: function () {
                },
                reportTestStart: function () {
                },
                reportTestDone: function (name, testRunInfo) {
                    videoLog.push(testRunInfo.videos);
                }
            }, taskMock);
        }

        createReporter();

        return Promise.all([
            emulateBrowserJob(taskMock, chromeTestRunMocks.slice(0, 2)),
            emulateBrowserJob(taskMock, firefoxTestRunMocks.slice(0, 2))
        ])
            .then(() => {
                expect(videoLog).eql([
                    [
                        { testRunId: 'f1t1-id1', videoPath: 'f1t1-path1' },
                        { testRunId: 'f1t1-id2', videoPath: 'f1t1-path2' }
                    ],
                    [
                        { testRunId: 'f1t2-id1', videoPath: 'f1t2-path1' },
                        { testRunId: 'f1t2-id2', videoPath: 'f1t2-path2' }
                    ]]
                );
            });
    });
});

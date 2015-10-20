var EventEmitter = require('events').EventEmitter;
var reporters    = require('../../lib/reporters/index');
var path         = require('path');
var util         = require('util');
var errs         = require('./errors');

var decoratorsPath = '../../lib/reporters/errors/decorators';

var screenshotDir = '/screenshots/1445437598847';

var testMocks = [
    {
        name:    'fixture1Test1',
        fixture: {
            name: 'fixture1',
            path: './fixture1.js'
        },

        screenshotExpected: true
    },
    {
        name:    'fixture1Test2',
        fixture: {
            name: 'fixture1',
            path: './fixture1.js'
        }
    },
    {
        name:    'fixture2Test1',
        fixture: {
            name: 'fixture2',
            path: './fixture2.js'
        }
    },
    {
        name:    'fixture2Test2',
        fixture: {
            name: 'fixture2',
            path: './fixture2.js'
        }
    },
    {
        name:    'fixture3Test1',
        fixture: {
            name: 'fixture3',
            path: './fixture3.js'
        },

        screenshotExpected: true
    }
];

var browserConnectionMock = { userAgent: 'Chrome 15.0.874 / Mac OS X 10.8.1' };

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

    this.tests              = testMocks;
    this.browserConnections = [browserConnectionMock];
    this.screenshots        = new ScreenshotsMock();
};

util.inherits(TaskMock, EventEmitter);

var testRunMocks = [
    {
        test:              testMocks[0],
        unstable:          false,
        browserConnection: browserConnectionMock,
        errs:              errs[0]
    },
    {
        test:              testMocks[1],
        unstable:          false,
        browserConnection: browserConnectionMock,
        errs:              errs[1]
    },
    {
        test:              testMocks[2],
        unstable:          true,
        browserConnection: browserConnectionMock,
        errs:              errs[2]
    },
    {
        test:                 testMocks[3],
        unstable:             false,
        browserConnection:    browserConnectionMock,
        errs:                 [],
        hasActionScreenshots: true
    },
    {
        test:              testMocks[4],
        unstable:          false,
        browserConnection: browserConnectionMock,
        errs:              []
    }
];

module.exports = function (type, decorator) {
    if (typeof reporters[type] !== 'function') {
        console.error('\nThe ' + type + ' reporter is not found.');
        return;
    }

    var errDecorator = null;

    try {
        errDecorator = decorator ? require(path.join(decoratorsPath, decorator)) : null;
    }
    catch (e) {
        console.error('\nThe ' + decorator + ' decorator is not found.');
        return;
    }

    var taskMock = new TaskMock();

    console.log('\n');

    new reporters[type](taskMock, process.stdout, errDecorator);

    taskMock.emit('start');

    testRunMocks.forEach(function (testRunMock) {
        taskMock.emit('test-run-start', testRunMock);
        taskMock.emit('test-run-done', testRunMock);
    });

    taskMock.emit('done');
};

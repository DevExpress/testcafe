const expect            = require('chai').expect;
const AsyncEventEmitter = require('../../lib/utils/async-event-emitter');
const TestRun           = require('../../lib/test-run');
const TestController    = require('../../lib/api/test-controller');
const Task              = require('../../lib/runner/task');
const BrowserJob        = require('../../lib/runner/browser-job');
const Reporter          = require('../../lib/reporter');
const { Role }          = require('../../lib/api/exportable-lib');

class TestRunMock extends TestRun {
    constructor () {
        super({ id: 'test-id', name: 'test-name', fixture: { path: 'dummy', id: 'fixture-id', name: 'fixture-name' } }, {}, {}, {}, {});


        this.browserConnection = {
            browserInfo: {
                alias: 'test-browser'
            },
            isHeadlessBrowser: () => false
        };
    }

    _addInjectables () {
    }

    _initRequestHooks () {
    }

    get id () {
        return 'test-run-id';
    }

    executeCommand () {
        return Promise.resolve();
    }
}

class TestControllerMock extends TestController {
    constructor (testRun) {
        super(testRun);

        testRun.controller = this;
    }
}

class TaskMock extends AsyncEventEmitter {
    constructor () {
        super();

        this.tests                   = [];
        this.browserConnectionGroups = [];
        this.opts                    = {};
    }

    _assignBrowserJobEventHandlers (job) {
        Task.prototype._assignBrowserJobEventHandlers.call(this, job);
    }
}

const options = {
    caretPos:  1,
    modifiers: {
        alt:   true,
        ctrl:  true,
        meta:  true,
        shift: true
    },
    offsetX:            1,
    offsetY:            2,
    destinationOffsetX: 3,
    destinationOffsetY: 4,
    speed:              1,
    replace:            true,
    paste:              true,
};

const actions = {
    click:                     ['#target', options],
    rightClick:                ['#target', options],
    doubleClick:               ['#target', options],
    hover:                     ['#target', options],
    drag:                      ['#target', 100, 200, options],
    dragToElement:             ['#target', '#target', options],
    typeText:                  ['#input', 'test', options],
    selectText:                ['#input', 1, 3, options],
    selectTextAreaContent:     ['#textarea', 1, 2, 3, 4, options],
    selectEditableContent:     ['#contenteditable', '#contenteditable', options],
    pressKey:                  ['enter', options],
    wait:                      [1],
    navigateTo:                ['./index.html'],
    setFilesToUpload:          ['#file', '../test.js'],
    clearUpload:               ['#file'],
    takeScreenshot:            [{ path: 'screenshotPath', fullPage: true }],
    takeElementScreenshot:     ['#target', 'screenshotPath'],
    resizeWindow:              [200, 200],
    resizeWindowToFitDevice:   ['Sony Xperia Z', { portraitOrientation: true }],
    maximizeWindow:            [],
    switchToIframe:            ['#iframe'],
    switchToMainWindow:        [],
    setNativeDialogHandler:    [() => true],
    getNativeDialogHistory:    [],
    getBrowserConsoleMessages: [],
    debug:                     [],
    setTestSpeed:              [1],
    setPageLoadTimeout:        [1],
    useRole:                   [new Role('http://example.com', async () => {}, { preserveUrl: true })],
};

let testController = null;
let task           = null;

const initializeReporter = (reporter) => {
    return new Reporter(reporter, task);
};

describe('TestController action events', () => {
    beforeEach(() => {
        const job               = new BrowserJob([], [], void 0, void 0, void 0, void 0, { TestRunCtor: TestRunMock });
        const testRunController = job._createTestRunController();
        const testRun           = new TestRunMock();

        testRunController.testRun = testRun;

        testController            = new TestControllerMock(testRun);
        task                      = new TaskMock();

        task._assignBrowserJobEventHandlers(job);
        testRunController._assignTestRunEvents(testRun);
    });

    it('Actions list', async () => {
        const startLog = [];
        const doneLog  = [];

        initializeReporter({
            async reportTestActionStart (name) {
                startLog.push(name);
            },

            async reportTestActionDone (name, { testRunId, command, test, fixture, browser }) {
                const item = { testRunId, name, command, test, fixture, browser };

                doneLog.push(item);
            }
        }, task);

        // eval and expect has their functional tests
        // addRequestHooks/removeRequestHooks are not logged
        const exceptions = ['eval', 'expect', 'addRequestHooks', 'removeRequestHooks'];

        const props = TestController.API_LIST
            .filter(prop => !prop.accessor)
            .map(prop => prop.apiProp)
            .filter(prop => exceptions.indexOf(prop) === -1)
            .filter(prop => typeof testController[prop] === 'function');

        props.forEach(prop => {
            if (!actions[prop])
                throw new Error(`Describe the '${prop}' command`);
        });

        const actionsKeys = Object.keys(actions);

        for (let i = 0; i < actionsKeys.length; i++)
            await testController[actionsKeys[i]].apply(testController, actions[actionsKeys[i]]);

        expect(actionsKeys.length).eql(startLog.length);
        expect(actionsKeys.length).eql(doneLog.length);
        expect(startLog).eql(actionsKeys);

        const expected = require('./data/test-controller-reporter-expected');

        expect(doneLog).eql(expected);
    });

    it('Error action', () => {
        let actionResult = null;

        initializeReporter({
            async reportTestActionDone (name, { command, errors }) {
                actionResult = { name, command: command.type, err: errors[0].message };
            }
        });

        testController.testRun.executeCommand = () => {
            throw new Error('test error');
        };

        return testController.click('#target')
            .then(() => {
                throw new Error();
            })
            .catch(err => {
                expect(err.message).eql('test error');
                expect(actionResult).eql({ name: 'click', command: 'click', err: 'test error' });
            });
    });
});

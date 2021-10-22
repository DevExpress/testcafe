const { expect }                     = require('chai');
const { noop }                       = require('lodash');
const AsyncEventEmitter              = require('../../lib/utils/async-event-emitter');
const delay                          = require('../../lib/utils/delay');
const TestController                 = require('../../lib/api/test-controller');
const Task                           = require('../../lib/runner/task');
const BrowserJob                     = require('../../lib/runner/browser-job');
const Reporter                       = require('../../lib/reporter');
const { Role }                       = require('../../lib/api/exportable-lib');
const TestRunErrorFormattableAdapter = require('../../lib/errors/test-run/formattable-adapter');
const BaseTestRunMock                = require('./helpers/base-test-run-mock');
const MessageBus                     = require('../../lib/utils/message-bus');

class TestRunMock extends BaseTestRunMock {
    constructor (messageBus) {
        super({
            test:              { id: 'test-id', name: 'test-name', fixture: { path: 'dummy', id: 'fixture-id', name: 'fixture-name' } },
            globalWarningLog:  { addPlainMessage: noop },
            browserConnection: { activeWindowId: 'activeWindowId' },
            messageBus,
        });

        this.browser = {
            alias:    'test-browser',
            headless: false,
        };

        this.disableMultipleWindows = false;
    }

    _internalExecuteCommand () {
        return delay(10);
    }

    get id () {
        return 'test-run-id';
    }
}

class TestControllerMock extends TestController {
    constructor (testRun) {
        super(testRun);

        testRun.controller = this;
    }

    _createCommand (CmdCtor, cmdArgs, callsite) {
        const command = super._createCommand(CmdCtor, cmdArgs, callsite);

        if (!command.actionId)
            throw new Error('command does not have action id');

        command.actionId = CmdCtor.name;

        return command;
    }
}

class TaskMock extends AsyncEventEmitter {
    constructor (messageBus) {
        super();

        this.tests                   = [];
        this.browserConnectionGroups = [];
        this.opts                    = {};
        this._messageBus             = messageBus;
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
        shift: true,
    },
    offsetX:            1,
    offsetY:            2,
    destinationOffsetX: 3,
    speed:              1,
    replace:            true,
    paste:              true,
};

const actionsWithoutOptions = {
    click:                   ['#target'],
    rightClick:              ['#target'],
    doubleClick:             ['#target'],
    hover:                   ['#target'],
    drag:                    ['#target', 100, 200],
    dragToElement:           ['#target', '#target'],
    typeText:                ['#input', 'test'],
    selectText:              ['#input', 1, 3],
    selectTextAreaContent:   ['#textarea', 1, 2, 3, 4],
    selectEditableContent:   ['#contenteditable', '#contenteditable'],
    pressKey:                ['enter'],
    takeScreenshot:          [{ path: 'screenshotPath', fullPage: true }],
    takeElementScreenshot:   ['#target', 'screenshotPath'],
    resizeWindowToFitDevice: ['Sony Xperia Z'],
};

const actions = {
    dispatchEvent:             ['#target', 'mousedown'],
    click:                     ['#target', options],
    rightClick:                ['#target', options],
    doubleClick:               ['#target', options],
    hover:                     ['#target', options],
    drag:                      ['#target', 100, 200, options],
    dragToElement:             ['#target', '#target', options],
    scroll:                    ['#target', 100, 200, options],
    scrollBy:                  ['#target', 100, 200, options],
    scrollIntoView:            ['#target', options],
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
    takeElementScreenshot:     ['#target', 'screenshotPath', { includeMargins: true, crop: { top: -100 } }],
    resizeWindow:              [200, 200],
    resizeWindowToFitDevice:   ['Sony Xperia Z', { portraitOrientation: true }],
    maximizeWindow:            [],
    switchToIframe:            ['#iframe'],
    switchToMainWindow:        [],
    openWindow:                ['http://example.com'],
    switchToWindow:            [{ id: 'window-id' }],
    closeWindow:               [{ id: 'window-id' }],
    getCurrentWindow:          [],
    switchToParentWindow:      [],
    switchToPreviousWindow:    [],
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
let messageBus     = null;

const initializeReporter = (reporter) => {
    return new Reporter(reporter, messageBus);
};

describe('TestController action events', () => {
    beforeEach(() => {
        messageBus = new MessageBus();

        const job = new BrowserJob({
            tests:                 [],
            browserConnections:    [],
            proxy:                 null,
            screenshots:           null,
            warningLog:            null,
            fixtureHookController: null,
            opts:                  { TestRunCtor: TestRunMock },
            messageBus,
        });

        const testRunController = job._createTestRunController();
        const testRun           = new TestRunMock(messageBus);

        testRunController.testRun = testRun;

        testController            = new TestControllerMock(testRun);
        task                      = new TaskMock(messageBus);

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
            },
        });

        await messageBus.emit('start', task);

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

    it('Error action', async () => {
        let actionResult   = null;
        let errorAdapter   = null;
        let resultDuration = null;

        initializeReporter({
            async reportTestActionDone (name, { command, duration, err }) {
                errorAdapter   = err;
                resultDuration = duration;
                actionResult   = { name, command: command.type, err: err.errMsg };
            },
        });

        await messageBus.emit('start', task);

        testController.testRun._internalExecuteCommand = () => {
            return delay(10)
                .then(() => {
                    throw new Error('test error');
                });
        };

        return testController.click('#target')
            .then(() => {
                throw new Error();
            })
            .catch(err => {
                expect(errorAdapter).instanceOf(TestRunErrorFormattableAdapter);
                expect(err.message).eql('test error');
                expect(resultDuration).to.be.a('number').with.above(0);
                expect(actionResult).eql({ name: 'click', command: 'click', err: 'Error: test error' });
            });
    });

    it('Duration', async () => {
        let resultDuration = null;

        initializeReporter({
            async reportTestActionDone (name, { duration }) {
                resultDuration = duration;
            },
        });

        await messageBus.emit('start', task);

        testController.testRun._internalExecuteCommand = () => {
            return delay(10);
        };

        return testController.click('#target')
            .then(() => {
                expect(resultDuration).to.be.a('number').with.above(0);
            });
    });

    it('Default command options should not be passed to the `reportTestActionDone` method', async () => {
        const log  = [];

        initializeReporter({
            async reportTestActionDone (name, { command }) {
                log.push(name);

                if (command.options)
                    log.push(command.options);
            },
        });

        await messageBus.emit('start', task);

        const actionsKeys = Object.keys(actionsWithoutOptions);

        for (let i = 0; i < actionsKeys.length; i++)
            await testController[actionsKeys[i]].apply(testController, actionsWithoutOptions[actionsKeys[i]]);

        expect(log).eql(actionsKeys);
    });

    it('Show only modified action options', async () => {
        const doneLog  = [];

        initializeReporter({
            async reportTestActionDone (name, { command }) {
                const item = { name };

                if (command.options)
                    item.options = command.options;

                doneLog.push(item);
            },
        }, task);

        await messageBus.emit('start', task);

        await testController.click('#target', { caretPos: 1, modifiers: { shift: true } });
        await testController.click('#target', { modifiers: { ctrl: false } });

        await testController.resizeWindowToFitDevice('iPhone 5', { portraitOrientation: true });
        await testController.resizeWindowToFitDevice('iPhone 5', { portraitOrientation: false });

        await testController.expect(true).eql(true, 'message', { timeout: 500 });
        await testController.expect(true).eql(true);

        const expectedLog = [
            {
                name:    'click',
                options: {
                    caretPos:  1,
                    modifiers: {
                        shift: true,
                    },
                },
            },
            { name: 'click' },
            {
                name:    'resizeWindowToFitDevice',
                options: {
                    portraitOrientation: true,
                },
            },
            { name: 'resizeWindowToFitDevice' },
            {
                name:    'eql',
                options: {
                    timeout: 500,
                },
            },
            { name: 'eql' },
        ];

        expect(doneLog).eql(expectedLog);
    });
});

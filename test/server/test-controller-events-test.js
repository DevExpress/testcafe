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

const {
    basicOptions,
    clickOptions,
    mouseOptions,
    offsetOptions,
    dragToElementOptions,
    typeTextOptions,
} = require('./data/test-controller-reporter-expected');

const actions = {
    dispatchEvent:             ['#target', 'mousedown'],
    click:                     ['#target', clickOptions],
    rightClick:                ['#target', clickOptions],
    doubleClick:               ['#target', clickOptions],
    hover:                     ['#target', mouseOptions],
    drag:                      ['#target', 100, 200, mouseOptions],
    dragToElement:             ['#target', '#target', dragToElementOptions],
    scroll:                    ['#target', 100, 200, offsetOptions],
    scrollBy:                  ['#target', 100, 200, offsetOptions],
    scrollIntoView:            ['#target', offsetOptions],
    typeText:                  ['#input', 'test', typeTextOptions],
    selectText:                ['#input', 1, 3, basicOptions],
    selectTextAreaContent:     ['#textarea', 1, 2, 3, 4, basicOptions],
    selectEditableContent:     ['#contenteditable', '#contenteditable', basicOptions],
    pressKey:                  ['enter', basicOptions],
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
    getCurrentCDPSession:      [],
    switchToParentWindow:      [],
    switchToPreviousWindow:    [],
    setNativeDialogHandler:    [() => true],
    getNativeDialogHistory:    [],
    getBrowserConsoleMessages: [],
    debug:                     [],
    setTestSpeed:              [1],
    setPageLoadTimeout:        [1],
    useRole:                   [new Role('http://example.com', async () => {}, { preserveUrl: true })],
    getCookies:                ['cookieName', 'https://domain.com'],
    setCookies:                [{ cookieName: 'cookieValue' }, 'https://domain.com'],
    deleteCookies:             [['cookieName1', 'cookieName2'], 'https://domain.com'],
    skipJsErrors:              [true],
    report:                    [],
};

let testController = null;
let task           = null;
let messageBus     = null;

const initializeReporter = (plugin) => {
    return new Reporter({ plugin, messageBus });
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

        // eval, expect and request has their functional tests
        // addRequestHooks/removeRequestHooks are not logged
        const exceptions = ['eval', 'expect', 'addRequestHooks', 'removeRequestHooks', 'request'];

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

        const { expectedLog } = require('./data/test-controller-reporter-expected');

        expect(doneLog).eql(expectedLog);
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

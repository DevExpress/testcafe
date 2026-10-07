const { expect }          = require('chai');
const { IsolatedSession } = require('../../lib/test-run/isolated-session');
const COMMAND_TYPE        = require('../../lib/test-run/commands/type');
const { initSelector }    = require('../../lib/test-run/commands/validations/initializers');

describe('IsolatedSession remote objects', () => {
    let calls     = null;
    let listeners = null;
    let client    = null;
    let lookups   = null;
    let polls     = null;

    function record (method, handler) {
        return async params => {
            calls.push({ method, params });

            return handler(params);
        };
    }

    function createSession () {
        const parentTestRun = { opts: {}, executeCommand: async () => {} };

        return new IsolatedSession({ parentTestRun, nativeAutomation: { cdpClient: client }, browserContextId: 'ctx-1' });
    }

    function releases () {
        return calls.filter(call => call.method === 'Runtime.releaseObjectGroup').map(call => call.params.objectGroup);
    }

    function click (selector) {
        return { type: COMMAND_TYPE.click, selector, options: {} };
    }

    beforeEach(() => {
        calls     = [];
        listeners = {};
        lookups   = 0;
        polls     = [];

        client = {
            Runtime: {
                on: (event, cb) => {
                    listeners[event] = cb;
                },

                evaluate: record('Runtime.evaluate', ({ expression }) => {
                    if (expression === 'document.readyState')
                        return { result: { value: 'complete' } };

                    if (polls.length)
                        return { result: polls.shift() };

                    return { result: { type: 'object', objectId: `el-${++lookups}` } };
                }),

                callFunctionOn: record('Runtime.callFunctionOn', ({ objectId, returnByValue }) => {
                    return returnByValue ? { result: { value: { x: 1, y: 1 } } } : { result: { objectId: `${objectId}-frame` } };
                }),

                releaseObjectGroup: record('Runtime.releaseObjectGroup', () => {}),
            },

            Page: {
                on:       () => {},
                navigate: record('Page.navigate', () => ({})),
            },

            Input: {
                dispatchMouseEvent: record('Input.dispatchMouseEvent', () => {}),
            },

            DOM: {
                describeNode: record('DOM.describeNode', () => ({ node: { frameId: 'frame-1' } })),
            },
        };
    });

    it('Should release the command object group after a command', async () => {
        const session = createSession();

        polls = [{ value: null }, { value: 'invisible' }];

        await session.executeCommand(click('#button'));

        const lookupGroups = calls.filter(call => call.method === 'Runtime.evaluate').map(call => call.params.objectGroup);

        expect(lookupGroups).eql(['isolated-command', 'isolated-command', 'isolated-command']);
        expect(calls[calls.length - 1].method).eql('Runtime.releaseObjectGroup');
        expect(releases()).eql(['isolated-command']);
    });

    it('Should release the command object group after a failing command and keep its error', async () => {
        const session = createSession();

        client.Input.dispatchMouseEvent = async () => {
            throw new Error('dispatch failed');
        };

        client.Runtime.releaseObjectGroup = record('Runtime.releaseObjectGroup', () => {
            throw new Error('Target closed');
        });

        let error = null;

        try {
            await session.executeCommand(click('#button'));
        }
        catch (err) {
            error = err;
        }

        expect(error.message).eql('dispatch failed');
        expect(releases()).eql(['isolated-command']);
    });

    it('Should release the command object group only after overlapping commands finish', async () => {
        const session  = createSession();
        const selector = initSelector('selector', '#label', { testRun: session.parentTestRun });
        let openGate   = null;
        const gate     = new Promise(resolve => {
            openGate = resolve;
        });

        client.Input.dispatchMouseEvent = record('Input.dispatchMouseEvent', () => gate);

        const clicking = session.executeCommand(click('#button'));

        await session.executeCommand(selector);

        expect(releases()).eql([]);

        openGate();
        await clicking;

        expect(releases()).eql(['isolated-command']);
    });

    it('Should keep iframe elements until switchToMainWindow', async () => {
        const session = createSession();

        listeners.executionContextCreated({ context: { id: 7, auxData: { isDefault: true, frameId: 'frame-1' } } });

        await session.withCommandObjectGroup(() => session.switchToIframe('#frame'));
        await session.executeCommand(click('#button'));

        const frameCopy   = calls.find(call => call.method === 'Runtime.callFunctionOn' && call.params.objectGroup === 'isolated-frames');
        const originCalls = calls.filter(call => call.method === 'Runtime.callFunctionOn' && call.params.objectId === 'el-1-frame');

        expect(frameCopy.params.objectId).eql('el-1');
        expect(originCalls.length).eql(1);
        expect(releases()).eql(['isolated-command', 'isolated-command']);

        await session.switchToMainWindow();

        expect(releases()).eql(['isolated-command', 'isolated-command', 'isolated-frames']);
    });

    it('Should release iframe elements on navigation', async () => {
        const session = createSession();

        listeners.executionContextCreated({ context: { id: 7, auxData: { isDefault: true, frameId: 'frame-1' } } });

        await session.withCommandObjectGroup(() => session.switchToIframe('#frame'));
        await session.executeCommand({ type: COMMAND_TYPE.navigateTo, url: 'http://example.test/' });

        const navigateIndex = calls.findIndex(call => call.method === 'Page.navigate');
        const frameRelease  = calls.findIndex(call => call.method === 'Runtime.releaseObjectGroup' && call.params.objectGroup === 'isolated-frames');

        expect(frameRelease).gte(0);
        expect(frameRelease).lt(navigateIndex);
    });
});

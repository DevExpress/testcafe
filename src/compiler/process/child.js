import Compiler from '../index';
import TestRunProxy from './test-run-proxy';
import EE from '../../utils/async-event-emitter';
import Transmitter from './transmitter';

const fs = require('fs');

class ChildTransport extends EE {
    constructor () {
        super();

        this.buffer = Buffer.alloc(65535);
    }

    async _lowRead () {
        return new Promise((resolve, reject) => {
            fs.read(3, this.buffer, 0, this.buffer.length, null, (err, len) => {
                if (err)
                    reject(err);
                else
                    resolve(len);
            })
        });
    }

    async read () {
        while (true) {
            const readLength = await this._lowRead();

            const data = this.buffer.slice(0, readLength);

            console.log('client', data.toString());

            this.emit('data', data);
        }
    }

    async write (data) {
        return new Promise((resolve, reject) => {
            fs.write(4, data, err => {
                if (err)
                    reject(err);
                else
                    resolve();
            });
        });
    }
}

global.proc = new Transmitter(new ChildTransport());

console.log('\n', process.argv, '\n');

const compiler = new Compiler(JSON.parse(process.argv[2]));

const state = {
    tests: {},
    fixtures: {}
};

let requestHooks = {};

function genRule (rule) {
    rule.id = require('nanoid')();

    if (typeof rule === 'function')
        return { type: 'function' };

    if (typeof x === 'string' || x instanceof RegExp)
        rule = { url: rule };

    if (rule.url instanceof RegExp)
        rule.url = { type: 'regexp', source: rule.url.source, flags: rule.url.flags };
    else
        rule.url = { type: typeof rule.url, value: rule.url };

    return rule;
}

function getContext (actor, testRunId) {
    if (!testRunId)
        return actor.fixtureCtx;

    if (!actor.testCtx[testRunId])
        actor.testCtx[testRunId] = new TestRunProxy(testRunId, actor.fixtureCtx);

    return actor.testCtx[testRunId];
}

proc.on('get-tests', async data => {
    console.log('ok');
    
    const tests = await compiler.getTests();

    tests.forEach(test => {
        for (const hook of test.requestHooks) {
            requestHooks[hook.id] = hook;
            hook.requestFilterRules = hook.requestFilterRules.map(genRule);
        }

        test = { ...test };
        test.fixture = { ...test.fixture };

        state.tests[test.id] = test;
        state.fixtures[test.fixture.id] = test.fixture;

        test.testCtx = Object.create(null);
        test.fixture.fixtureCtx = Object.create(null);

        test.fixtureCtx = test.fixture.fixtureCtx;
        test.fixture.testCtx = test.testCtx;
    });

    console.log(tests);
    return tests;
})
proc.on('run-test', async data => {
    const actor   = state[data.actor][data.idx];
    const context = getContext(actor, data.testRunId);

    await actor[data.func](context);
})           
proc.on('on-request', async data => {
    if (requestHooks[data.id])
        await requestHooks[id].onRequest(data.event);
})           
proc.on('on-response', async data => {
    if (requestHooks[data.id])
        await requestHooks[id].onResponse(data.event);
})           
proc.on('on-configure-response', async data => {
    if (requestHooks[data.id])
        await requestHooks[id]._onConfigureResponse(data.event);
})           
proc.on('add-request-hooks', async data => {
    const hooks = data.hooks.filter(hook => !requestHooks[hook.id]);

    hooks.forEach(hook => {
        requestHooks[hook.id] = hook;

        hook.requestFilterRules = hook.requestFilterRules.map(genRule);
    });
})
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

    _lowReadSync () {
        return fs.readSync(5, this.buffer, 0, this.buffer.length, null);
    }

    async read () {
        while (true) {
            const readLength = await this._lowRead();

            const data = this.buffer.slice(0, readLength);

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

    readSync () {
        const readLength = this._lowReadSync();

        return this.buffer.slice(0, readLength);
    }

    writeSync (data) {
        fs.writeSync(4, data);
    }
}

function genRule (rule) {
    rule.id = require('nanoid')();

    if (typeof rule === 'function')
        return { type: 'function' };

    if (typeof rule === 'string' || rule instanceof RegExp)
        rule = { url: rule };

    if (rule.url instanceof RegExp)
        rule.url = { type: 'regexp', source: rule.url.source, flags: rule.url.flags };
    else
        rule.url = { type: typeof rule.url, value: rule.url };

    return rule;
}



class CompilerDispatcher {
    constructor () {
        this.transmitter = new Transmitter(new ChildTransport());

        this.state =
        {
            tests: {},
            fixtures: {},
            roles: {},
            requestHooks: {},
            filterRules: {}
        };

        this._setupRoutes();
    }

    _getContext (actor, testRunId) {
        if (!testRunId)
            return actor.fixtureCtx;

        if (!actor.testCtx[testRunId])
            actor.testCtx[testRunId] = new TestRunProxy(this, testRunId, actor.fixtureCtx);

        return actor.testCtx[testRunId];
    }

    _setupRoutes () {
        this.transmitter.on('get-tests', async data => this.getTests(data))
        this.transmitter.on('run-test', async data => this.runTest(data))
        this.transmitter.on('on-request', async data => this.onRequest(data))
        this.transmitter.on('on-response', async data => this.onResponse(data))
        this.transmitter.on('on-configure-response', async data => this.onConfigureResponse(data));
        this.transmitter.on('filter-rule', async data => this.filterRule(data));
        this.transmitter.on('clean-up', () => this.cleanUp());
        this.transmitter.on('exit', () => {setTimeout(() => process.kill(process.pid),200)})
    }

    async cleanUp () {
        await Compiler.cleanUp();
    }

    async getTests (sources) {
        console.log(sources);
        const compiler = new Compiler(sources);
        const tests    = await compiler.getTests();

        tests.forEach(test => {
            for (const hook of test.requestHooks) {
                this.state.requestHooks[hook.id] = hook;

                if (!hook.requestFilterRules)
                    return;

                if (!Array.isArray(hook.requestFilterRules))
                    hook.requestFilterRules = [hook.requestFilterRules];

                hook.requestFilterRules.forEach(rule => {
                    if (typeof rule === 'function')
                        this.state.filterRules[rule.id] = rule;
                });

                hook.requestFilterRules = hook.requestFilterRules.map(genRule);
            }

            test = { ...test };
            test.fixture = { ...test.fixture };

            this.state.tests[test.id] = test;
            this.state.fixtures[test.fixture.id] = test.fixture;

            test.testCtx = Object.create(null);
            test.fixture.fixtureCtx = Object.create(null);

            test.fixtureCtx = test.fixture.fixtureCtx;
            test.fixture.testCtx = test.testCtx;
        });

        return tests;
    }

    async runTest (data) {
        const actor   = this.state[data.actor][data.idx];
        const context = this._getContext(actor, data.testRunId);

        await actor[data.func](context);
    }

    async onRequest (data) {
        if (this.state.requestHooks[data.id]) {
            event.setMock = mock => data.event.mock = mock;

            await this.state.requestHooks[data.id].onRequest(data.event);

            return data.event;
        }
    }

    async onResponse (data) {
        if (this.state.requestHooks[data.id])
            await this.state.requestHooks[data.id].onResponse(data.event);
    }

    async onConfigureResponse (data) {
        if (!this.state.requestHooks[data.id])
            return;

        await this.state.requestHooks[data.id]._onConfigureResponse(data.event);

        return data.event;
    }

    async filterRule (data) {
        if (this.state.filterRules[data.id])
            return await this.state.filterRules[data.id](data.request);
    }

    async useRole ({ id, role }) {
        const roleData = { ...role };

        this.state.roles[role.id] = role;

        role.testCtx    = Object.create(null);
        role.fixtureCtx = Object.create(null);

        roleData.initFn = !!roleData.initFn;

        return await this.transmitter.send('use-role', { id, role: roleData });
    }

    async addRequestHooks ({ id, hooks }) {
        hooks.forEach(hook => {
            this.state.requestHooks[hook.id] = hook;

            if (!hook.requestFilterRules)
                return;

            if (!Array.isArray(hook.requestFilterRules))
                hook.requestFilterRules = [hook.requestFilterRules];

            hook.requestFilterRules = hook.requestFilterRules.map(genRule);
        });

        await this.transmitter.send('add-request-hooks', { id, hooks })
    }

    async removeRequestHooks (hooks) {
        await this.transmitter.send('remove-request-hooks', { id, hooks })
    }
}


export default new CompilerDispatcher();

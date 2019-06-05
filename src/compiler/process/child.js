import Compiler from '../index';
import TestRunProxy from './test-run-proxy';
import EE from '../../utils/async-event-emitter';
import Transmitter from './transmitter';

const fs = require('fs');

class Transmitter extends EE {
    constructor () {
        super();

        this.requestCounter = 0;

        this.inBuffer = Buffer.alloc(64535);

        this.listen();
    }

    _read () {

    }

    async listen () {
        while (true) {
            const len = await this._read();

            const packet = JSON.parse(this.inBuffer.slice(0, len).toString());

            if (packet.type === 'response')
                await this.emit(`response-${packet.id}`, packet.data);
            else
                await this.emit('message', packet.data);
        }
    }

    async _send (data) {
        return new Promise((resolve, reject) => {
            fs.write(4, JSON.stringify(data), err => {
                if (err)
                    reject(err);
                else
                    resolve();
            });
        });
    }

    _registerMessage (message) {
        return {
            id:   this.requestCounter++,
            data: message
        };
    }

    async send (message) {
        const packet          = this._registerMessage(message);
        const responsePromise = this.once(`response-${id}`);

        await this._send(packet);

        return responsePromise;
    }
}

global.proc = new Transmitter({
    buffer: Buffer.alloc(65535),

    async _lowRead () {
        return new Promise((resolve, reject) => {
            fs.read(3, this.buffer, 0, this.buffer.length, null, (err, len) => {
                if (err)
                    reject(err);
                else
                    resolve(len);
            })
        });
    },

    async read () {
        const readLength = await this._lowRead();

        return this.buffer.slice(0, readLength);
    },

    async write (data) {
        return new Promise((resolve, reject) => {
            fs.write(4, JSON.stringify(data), err => {
                if (err)
                    reject(err);
                else
                    resolve();
            });
        });
    }
});

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

    return actor.testCtx;
}

proc.on('message', async data => {
   switch (data.name) {
       case 'getTests':
           const tests = await compiler.getTests();

           proc.send({ name:'getTests', tests });

           tests.forEach(test => {
               test.testCtx = Object.create(null);
               test.fixture.fixtureCtx = Object.create(null);

               test.fixtureCtx = test.fixture.fixtureCtx;
               test.fixture.testCtx = test.testCtx;

               state.tests[test.id] = test;
               state.fixtures[test.fixture.id] = test.fixture;

               for (const hook of test.requestHooks) {
                   requestHooks[hook.id] = hook;
                   hook.requestFilterRules = hook.requestFilterRules.map(genRule);
               }
           });

           return;
       case 'runTest':
           try {
               const actor   = state[data.actor][data.idx];
               const context = getContext(actor, data.testRunId);

               await actor[data.func](context);

               proc.send({ name: 'runTest' });
           }
           catch (error) {
               proc.send({ name: 'runTest', error });
           }
       case 'on-request':
           if (requestHooks[data.id])
                await requestHooks[id].onRequest(data.event);

           proc.send({ name: 'on-request' });

           return;
       case 'on-response':
           if (requestHooks[data.id])
               await requestHooks[id].onResponse(data.event);

           proc.send({ name: 'on-response' });

           return;
       case 'on-configure-response':
           if (requestHooks[data.id])
               await requestHooks[id]._onConfigureResponse(data.event);

           proc.send({ name: 'on-configure-response' });

           return;
       case 'add-request-hooks':
           const hooks = data.hooks.filter(hook => !requestHooks[hook.id]);

           hooks.forEach(hook => {
               requestHooks[hook.id] = hook;

               hook.requestFilterRules = hook.requestFilterRules.map(genRule);
           });

           proc.send({ name: 'add-request-hooks', id: data.id, hooks });

           return;

   }
});

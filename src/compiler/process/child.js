import Compiler from '../index';
import TestRunProxy from './test-run-proxy';
import EE from '../../utils/async-event-emitter';

const fs = require('fs');

class Transmitter extends EE {
    constructor () {
        super();

        this.inBuffer  = Buffer.alloc(64535);

        this.listen();
    }

    _read () {
        return new Promise((resolve, reject) => {
            fs.read(3, this.inBuffer, 0, this.inBuffer.length, null, (err, len) => {
                if (err)
                    reject(err);
                else
                    resolve(len);
            })
        });
    }

    async listen () {
        while (true) {
            const len = await this._read();

            await this.emit('message', JSON.parse(this.inBuffer.slice(0, len).toString()));
        }
    }

    async send (message) {
        return new Promise((resolve, reject) => {
            fs.write(4, JSON.stringify(message), err => {
                if (err)
                    reject(err);
                else
                    resolve();
            });
        });
    }
}

global.proc = new Transmitter();

console.log('\n', process.argv, '\n');

const compiler = new Compiler(JSON.parse(process.argv[2]));

let tests = null;
let requestHooks = {};

proc.on('message', async data => {
   switch (data.name) {
       case 'getTests':
           tests = await compiler.getTests();

           proc.send({ name:'getTests', tests });

           tests.forEach(test => {
               for (const hook of test.requestHooks)
                   requestHooks[hook.id] = hook;
           });

           return;
       case 'runTest':
           try {
               await tests[data.idx].fn(new TestRunProxy(data.testRunId, tests[data.idx]));

               proc.send({ name: 'runTest' });
           }
           catch (error) {
               proc.send({ name: 'runTest', error });
           }
       case 'on-request':
           if (requestHooks[data.id])
                await requestHooks[id].onRequest(data.event);

           process.send({ name: 'on-request' });

           return;
       case 'on-response':
           if (requestHooks[data.id])
               await requestHooks[id].onResponse(data.event);

           process.send({ name: 'on-response' });

           return;
       case 'on-configure-response':
           if (requestHooks[data.id])
               await requestHooks[id]._onConfigureResponse(data.event);

           process.send({ name: 'on-configure-response' });

           return;
       case 'add-request-hook':
           if (requestHooks[data.id])
               return;

           requestHooks[data.id] = data;

           process.send({ name: 'add-request-hook', hook: data });

           return;

   }
});

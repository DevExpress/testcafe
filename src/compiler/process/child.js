import Compiler from '../index';
import TestRunProxy from './test-run-proxy';
import EE from '../../utils/async-event-emitter';

const fs = require('fs');

const r = fs.createReadStream('', { fd: 3 });
const w = fs.createWriteStream('', { fd: 3 });




global.proc = new EE();

const reader = data => {
    console.log('innerdata');
    //proc.emit('message', JSON.parse(data.toString()))
};

proc.send = message => {
    console.log('msg', message);
    console.log(w.write(JSON.stringify('asdadsdadadaadadsadadadasd')));
    w.end();
}

console.log('\n', process.argv, '\n');

const compiler = new Compiler(JSON.parse(process.argv[2]));

let tests = null;

proc.on('message', data => {
    console.log(data);
   switch (data.name) {
       case 'getTests':
           w.write('ololo');
           return;
           compiler.getTests().then(result => { console.log('tests ok'); tests = result; proc.send({}) });
           return;
       case 'runTest':
           Promise.resolve(tests[data.idx].fn(new TestRunProxy(data.testRunId))).then(() => proc.send({})).catch(error => proc.send({ error }));
           return;
   }
});

setTimeout(() => {
    w.write(JSON.stringify('asdaasdadadasdadasd') )

}, 3000);

import Compiler from '../index';
import testRunProxy from './test-run-proxy';


const compiler = new Compiler(JSON.parse(process.argv[2]));

let tests = null;

process.on('message', data => {
   switch (data.name) {
       case 'getTests':
           compiler.getTests().then(result => { tests = result; process.send(result) });
           return;
       case 'runTest':
           Promise.resolve(tests[data.idx].fn(testRunProxy)).then(() => process.send({}));
           return;
   }
});

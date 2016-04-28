// NOTE: to preserve callsites, add new tests AFTER the existing ones
import { Hybrid } from 'testcafe';
import { expect } from 'chai';

fixture `Hybrid function`
    .page `http://localhost:3000/api/es-next/hybrid-function/pages/index.html`;

const getLocation  = Hybrid(() => document.location.toString());
const getUserAgent = Hybrid(() => navigator.userAgent);

test('Dispatch', async () => {
    throw await getUserAgent();
});

test('Call with arguments', async () => {
    const getElementText = Hybrid((className, idx) => document.querySelectorAll('.' + className)[idx].textContent);
    const answer         = await getElementText('answer', 1);

    expect(answer.trim()).eql('42');
});

test('Hammerhead code instrumentation', async () => {
    const location = await getLocation();

    expect(location).eql('http://localhost:3000/api/es-next/hybrid-function/pages/index.html');
});

test('Hybrid fn is not a function', async () => {
    await Hybrid(123)();
});

test('Hybrid fn test run is unresolvable', async () => {
    var fs = require('fs');

    var hybrid = Hybrid(() => 123);

    return new Promise((resolve, reject) => {
        fs.readFile('not/exists', () => {
            try {
                hybrid();
                resolve();
            }
            catch (err) {
                reject(err);
            }
        });
    });
});

test('Async syntax in Hybrid', async () => {
    Hybrid(async () => Promise.resolve());
});

test('Generator in Hybrid', async () => {
    Hybrid(function*() {
        yield 1;
    });
});

test('Bind Hybrid function', async t => {
    const fs               = require('fs');
    const boundGetLocation = getLocation.bindTestRun(t);

    // NOTE: binding does not modify the original function,
    // but creates a new bound function instead, so here it will throw an error.
    var originalHybridExec = new Promise((resolve, reject) => {
        fs.readFile('not/exists', () => {
            try {
                getLocation();
                resolve();
            }
            catch (err) {
                reject(err);
            }
        });
    });

    return originalHybridExec
        .then(() => {
            throw new Error('Promise rejection expected');
        })
        .catch(() => {
            return new Promise(resolve => {
                fs.readFile('not/exists', () => resolve(boundGetLocation()));
            });
        })
        .then(location => expect(location).eql('http://localhost:3000/api/es-next/hybrid-function/pages/index.html'));
});

test('Invalid Hybrid test run binding', () => {
    Hybrid(() => 123).bindTestRun({});
});

test('Promises support', async () => {
    var res = await Hybrid(() => {
        return Promise
            .resolve()
            .then(()=> {
                return new Promise(resolve => {
                    window.setTimeout(() => resolve(42), 100);
                });
            });
    })();

    expect(res).eql(42);
});


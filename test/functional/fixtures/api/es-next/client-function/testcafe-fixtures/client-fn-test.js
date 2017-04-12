// NOTE: to preserve callsites, add new tests AFTER the existing ones
import { ClientFunction } from 'testcafe';
import { expect } from 'chai';

fixture `ClientFunction`
    .page `http://localhost:3000/fixtures/api/es-next/client-function/pages/index.html`;

const getLocation  = ClientFunction(() => document.location.toString());
const getUserAgent = ClientFunction(() => navigator.userAgent);

test('Dispatch', async () => {
    throw await getUserAgent();
});

test('Call with arguments', async () => {
    const getElementText = ClientFunction((className, idx) => {
        return document.querySelectorAll('.' + className)[idx].textContent;
    });

    const answer = await getElementText('answer', 1);

    expect(answer.trim()).eql('42');
});

test('Hammerhead code instrumentation', async () => {
    const location = await getLocation();

    expect(location).eql('http://localhost:3000/fixtures/api/es-next/client-function/pages/index.html');
});

test('ClientFunction fn is not a function', async () => {
    await ClientFunction(123)();
});

test('ClientFunction fn test run is unresolvable', async () => {
    var fs = require('fs');

    var fn = ClientFunction(() => 123);

    return new Promise((resolve, reject) => {
        fs.readFile('not/exists', async () => {
            try {
                await fn();
                resolve();
            }
            catch (err) {
                reject(err);
            }
        });
    });
});

test('Async syntax in ClientFunction', async () => {
    ClientFunction(async () => Promise.resolve());
});

test('Generator in ClientFunction', async () => {
    ClientFunction(function*() {
        yield 1;
    });
});

test('Bind ClientFunction', async t => {
    const fs               = require('fs');
    const boundGetLocation = getLocation.with({ boundTestRun: t });

    // NOTE: binding does not modify the original function,
    // but creates a new bound function instead, so here it will throw an error.
    var originalClientFnExec = new Promise((resolve, reject) => {
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

    return originalClientFnExec
        .then(() => {
            throw new Error('Promise rejection expected');
        })
        .catch(() => {
            return new Promise(resolve => {
                fs.readFile('not/exists', () => resolve(boundGetLocation()));
            });
        })
        .then(location => expect(location).eql('http://localhost:3000/fixtures/api/es-next/client-function/pages/index.html'));
});

test('Invalid ClientFunction test run binding', () => {
    ClientFunction(() => 123).with({ boundTestRun: {} });
});

test('Promises support', async () => {
    var res = await ClientFunction(() => {
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

test('Babel artifacts polyfills', async () => {
    var res = await ClientFunction(() => {
        var obj = { 1: '1', '2': 2 };

        return typeof obj === 'object' ? JSON.stringify(Object.keys(obj)) : null;
    })();

    expect(JSON.parse(res)).eql(['1', '2']);
});

test('Error in code', async () => {
    var fn = ClientFunction(() => {
        throw new Error('Hey ya!');
    });

    await fn();
});

test('Error in Promise', async () => {
    var fn = ClientFunction(() => {
        return Promise.resolve().then(()=> {
            throw new Error('42');
        });
    });

    await fn();
});

const selectByClassName = ClientFunction(className => document.querySelectorAll('.' + className));
const nthByClass        = ClientFunction((className, n) => selectByClassName(className)[n], { dependencies: { selectByClassName } });

test('ClientFunction with dependencies', async () => {
    const getAnswer = ClientFunction(() => {
        const el       = nthByClass('item', 3);
        const answerEl = selectByClassName(el.textContent.toLowerCase())[0];

        return answerEl.textContent;
    }, { dependencies: { selectByClassName, nthByClass } });

    const answer = await getAnswer();

    expect(answer).eql('42!');
});

test('Redirect during execution', async () => {
    const fn = ClientFunction(() => new Promise(() => {
        window.location = 'index.html';
    }));

    await fn();
});

test('ClientFunction call with complex argument types', async () => {
    const fn = ClientFunction((re, err, undef, nan) => {
        return re instanceof RegExp &&
               re.source === '\\S+' &&
               err instanceof Error &&
               err.message === 'Hey!' &&
               undef === void 0 &&
               isNaN(nan);
    });

    const res = await fn(/\S+/ig, new Error('Hey!'), void 0, NaN);

    expect(res).to.be.true;
});

test('ClientFunction call with complex return types', async () => {
    const fn = ClientFunction(() => {
        return [/\S+/ig, new Error('Hey!'), void 0, NaN];
    });

    const res = await fn();

    expect(res[0]).to.be.instanceof(RegExp);
    expect(res[0].source).eql('\\S+');
    expect(res[1]).to.be.instanceof(Error);
    expect(res[1].message).eql('Hey!');
    expect(res[2]).to.be.undefined;
    expect(res[3]).to.be.NaN;
});

test('ClientFunction with function argument', async () => {
    function getAnswer () {
        return new Promise(resolve => {
            setTimeout(() => resolve(42), 30);
        });
    }

    const hfn    = ClientFunction(fn => fn());
    const answer = await hfn(getAnswer);

    expect(answer).eql(42);
});

test('Async/await in function argument of ClientFunction', async () => {
    const hfn = ClientFunction(fn => fn());

    await hfn(async () => Promise.resolve());
});

test('ClientFunction with ClientFunction argument', async () => {
    const hfn      = ClientFunction(fn => fn());
    const location = await hfn(getLocation);

    expect(location).eql('http://localhost:3000/fixtures/api/es-next/client-function/pages/index.html');
});

test('ClientFunction without `await`', async () => {
    getLocation();
});

test('DOM node return value', async () => {
    const getSomeNodes = ClientFunction(() => {
        const answer = document.querySelector('.answer');

        return [answer.childNodes[0], document];
    });

    await getSomeNodes();
});

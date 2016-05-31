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

test('Babel artifacts polyfills', async () => {
    var res = await Hybrid(() => {
        var obj = { 1: '1', '2': 2 };

        return typeof obj === 'object' ? JSON.stringify(Object.keys(obj)) : null;
    })();

    expect(JSON.parse(res)).eql(['1', '2']);
});

test('Error in code', async () => {
    var fn = Hybrid(() => {
        throw new Error('Hey ya!');
    });

    await fn();
});

test('Error in Promise', async () => {
    var fn = Hybrid(() => {
        return Promise.resolve().then(()=> {
            throw new Error('42');
        });
    });

    await fn();
});

const selectByClassName = Hybrid(className => document.querySelectorAll('.' + className));
const nthByClass        = Hybrid((className, n) => selectByClassName(className)[n], { selectByClassName });

test('Hybrid dependencies', async () => {
    const getAnswer = Hybrid(() => {
        const el       = nthByClass('item', 3);
        const answerEl = selectByClassName(el.textContent.toLowerCase())[0];

        return answerEl.textContent;
    }, { selectByClassName, nthByClass });

    const answer = await getAnswer();

    expect(answer).eql('42!');
});

test('Redirect during execution', async () => {
    await Hybrid(() => new Promise(() => window.location = 'index.html'))();
});

test('Hybrid call with complex argument types', async () => {
    const fn = Hybrid((re, err, undef, nan) => {
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

test('Hybrid call with complex return types', async () => {
    const fn = Hybrid(() => {
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

test('Hybrid function with function argument', async () => {
    function getAnswer () {
        return new Promise(resolve => {
            setTimeout(() => resolve(42), 30);
        });
    }

    const hfn    = Hybrid(fn => fn());
    const answer = await hfn(getAnswer);

    expect(answer).eql(42);
});

test('Async code in function argument of Hybrid function', async () => {
    const hfn = Hybrid(fn => fn());

    await hfn(async () => Promise.resolve());
});

test('Hybrid function with hybrid argument', async () => {
    const hfn      = Hybrid(fn => fn());
    const location = await hfn(getLocation);

    expect(location).eql('http://localhost:3000/api/es-next/hybrid-function/pages/index.html');
});

test('Hybrid function without `await`', async () => {
    getLocation();
});

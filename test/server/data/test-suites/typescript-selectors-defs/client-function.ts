import { expect } from 'chai';


(async () => {
    const dep      = true;
    const someFunc = ClientFunction(() => dep, { dependencies: { dep } });

    const getLocation = ClientFunction(() => document.location.toString());
    const getUserAgent = ClientFunction(() => navigator.userAgent);

    await someFunc();

    await getUserAgent();

    const getElementText = ClientFunction((className: string, idx: number) => {
        return document.querySelectorAll('.' + className)[idx].textContent;
    });

    const answer1 = await getElementText('answer', 1);

    if (!answer1)
        return;

    expect(answer1.trim()).eql('42');

    const location1 = await getLocation();

    expect(location1).eql('http://localhost:3000/fixtures/api/es-next/client-function/pages/index.html');


    ClientFunction(async() => Promise.resolve());

    ClientFunction(function*() {
        yield 1;
    });

    const res1 = await ClientFunction(() => {
        return Promise
            .resolve()
            .then(()=> {
                return new Promise(resolve => {
                    window.setTimeout(() => resolve(42), 100);
                });
            });
    })();

    expect(res1).eql(42);

    const res2 = await ClientFunction(() => {
        const obj = {1: '1', '2': 2};

        return typeof obj === 'object' ? JSON.stringify(Object.keys(obj)) : null;
    })();

    if (!res2)
        return;

    expect(JSON.parse(res2)).eql(['1', '2']);

    const fn1 = ClientFunction(() => {
        throw new Error('Hey ya!');
    });

    await fn1();

    const fn2 = ClientFunction(() => {
        return Promise.resolve().then(()=> {
            throw new Error('42');
        });
    });

    await fn2();

    const selectByClassName: any = ClientFunction((className: string) => document.querySelectorAll('.' + className));
    const nthByClass = ClientFunction((className: string, n: number) => selectByClassName(className)[n], {dependencies: {selectByClassName}});

    nthByClass('foo', 42);

    const fn3 = ClientFunction((re: any, err: any, undef: any, nan: any) => {
        return re instanceof RegExp &&
            re.source === '\\S+' &&
            err instanceof Error &&
            err.message === 'Hey!' &&
            undef === void 0 &&
            isNaN(nan);
    });

    const res3 = await fn3(/\S+/ig, new Error('Hey!'), void 0, NaN);

    expect(res3).to.be.true;

    const fn4 = ClientFunction((): [RegExp, Error, any, number] => {
        return [/\S+/ig, new Error('Hey!'), void 0, NaN];
    });

    const res4 = await fn4();

    expect(res4[0]).to.be.instanceof(RegExp);
    expect(res4[0].source).eql('\\S+');
    expect(res4[1]).to.be.instanceof(Error);
    expect(res4[1].message).eql('Hey!');
    expect(res4[2]).to.be.undefined;
    expect(res4[3]).to.be.NaN;

    function getAnswer() {
        return new Promise(resolve => {
            setTimeout(() => resolve(42), 30);
        });
    }

    const hfn1 = ClientFunction((fn: Function) => fn());
    const answer = await hfn1(getAnswer);

    expect(answer).eql(42);

    const hfn2 = ClientFunction((fn: Function) => fn());

    await hfn2(async() => Promise.resolve());

    const hfn3 = ClientFunction((fn: Function) => fn());
    const location2 = await hfn3(getLocation);

    expect(location2).eql('http://localhost:3000/fixtures/api/es-next/client-function/pages/index.html');

    getLocation();

    const getSomeNodes = ClientFunction(() => {
        const answer = document.querySelector('.answer');

        if (!answer)
            return [];

        return [answer.childNodes[0], document];
    });

    await getSomeNodes();
})();

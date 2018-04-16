import { RequestHook } from 'testcafe';
import path from 'path';

const ResultPromise = require(path.resolve('./lib/utils/re-executable-promise'));
const pageUrl       = 'http://localhost:3000/fixtures/api/es-next/request-hooks/pages/index.html';

class TestRequestHook extends RequestHook {
    constructor () {
        super(pageUrl);

        this.onResponseCallCountInternal = 0;
    }

    get onResponseCallCount () {
        return ResultPromise.fromFn(async () => this.onResponseCallCountInternal);
    }

    onRequest () {}

    onResponse () {
        this.onResponseCallCountInternal++;
    }
}

const hook1 = new TestRequestHook();
const hook2 = new TestRequestHook();
const hook3 = new TestRequestHook();

fixture `Fixture`
    .requestHooks(hook1)
    .page(pageUrl);

test
    .requestHooks(hook2)
    ('Test', async t => {
        await t
            .expect(hook1.onResponseCallCount).eql(1)
            .expect(hook2.onResponseCallCount).eql(1);

        await t
            .addRequestHooks(hook3)
            .expect(hook3.onResponseCallCount).eql(0)
            .navigateTo(pageUrl)
            .expect(hook1.onResponseCallCount).eql(2)
            .expect(hook2.onResponseCallCount).eql(2)
            .expect(hook3.onResponseCallCount).eql(1);

        await t
            .addRequestHooks(hook1, hook2, hook3)
            .navigateTo(pageUrl)
            .expect(hook1.onResponseCallCount).eql(3)
            .expect(hook2.onResponseCallCount).eql(3)
            .expect(hook3.onResponseCallCount).eql(2);

        await t
            .removeRequestHooks(hook1)
            .removeRequestHooks(hook1)
            .navigateTo(pageUrl)
            .expect(hook1.onResponseCallCount).eql(3)
            .expect(hook2.onResponseCallCount).eql(4)
            .expect(hook3.onResponseCallCount).eql(3);
    });

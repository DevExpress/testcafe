import { RequestHook } from 'testcafe';
import path from 'path';

const ReExecutablePromise = require(path.resolve('./lib/utils/re-executable-promise'));
const result              = [];
const pageUrl             = 'http://localhost:3000/fixtures/api/es-next/request-hooks/pages/index.html';

class TestRequestHook extends RequestHook {
    constructor (name) {
        super(pageUrl);

        this.name  = name;
        this._done = false;
    }

    async onRequest () {
        result.push(this.name);

        this._done = true;
    }

    async onResponse () {}

    get done () {
        return ReExecutablePromise.fromFn(async () => this._done);
    }
}

const hook1 = new TestRequestHook('1');
const hook2 = new TestRequestHook('2');

fixture `Fixture`
    .requestHooks(hook1);

test
    .requestHooks(hook2)
    ('test', async t => {
        await t
            .navigateTo(pageUrl)
            .expect(hook1.done).ok()
            .expect(hook2.done).ok();


        const expectedResult = '1,2';

        await t.expect(result.toString()).eql(expectedResult);
    });

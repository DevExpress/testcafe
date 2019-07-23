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

        // NOTE: If caching is prevented for the page and 'retryTestPages' option is turned on
        // then the tested page will be requested twice.
        const expectedResult = t.testRun.opts.retryTestPages ? '1,2,1,2' : '1,2';

        await t.expect(result.toString()).eql(expectedResult);
    });

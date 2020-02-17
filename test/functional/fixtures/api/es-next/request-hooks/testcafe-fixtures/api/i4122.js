import { RequestHook } from 'testcafe';
import path from 'path';
import config from '../../../../../../config';

const ReExecutablePromise = require(path.resolve('./lib/utils/re-executable-promise'));
const pageUrl             = 'http://localhost:3000/fixtures/api/es-next/request-hooks/pages/index.html';

const log = [];

class TestRequestHook extends RequestHook {
    constructor (name) {
        super(pageUrl);

        this.name  = name;
        this._done = false;
    }

    async onRequest () {
        log.push(this.name);
    }

    async onResponse () {
        this._done = true;
    }

    get done () {
        return ReExecutablePromise.fromFn(async () => this._done);
    }
}

const fixtureHook = new TestRequestHook('fixtureHook');
const testHook    = new TestRequestHook('testHook');

fixture `Fixture`
    .requestHooks(fixtureHook);

test('test', async t => {
    await t
        .navigateTo(pageUrl)
        .expect(fixtureHook.done).ok()
        .expect(testHook.done).ok();

    const expectedLog = config.retryTestPages ? 'fixtureHook,testHook,fixtureHook,testHook' : 'fixtureHook,testHook';

    await t.expect(log.toString()).eql(expectedLog);
}).requestHooks(testHook);

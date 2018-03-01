import { RequestHook } from 'testcafe';

class TestRequestHook extends RequestHook {
    constructor () {
        super();
    }
}

const hook1   = new TestRequestHook();
const hook2   = new TestRequestHook();
const hookArr = [hook1, hook2];

fixture `Fixture`
    .requestHooks(hookArr);

test
    .addRequestHooks(hookArr)
    ('test', async t => {});

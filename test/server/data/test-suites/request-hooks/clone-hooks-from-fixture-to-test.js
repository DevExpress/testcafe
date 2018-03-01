import { RequestHook } from 'testcafe';

class RequestHook1 extends RequestHook {
    constructor () {
        super();
    }
}
class RequestHook2 extends RequestHook {
    constructor () {
        super();
    }
}

class RequestHook3 extends RequestHook {
    constructor () {
        super();
    }
}

fixture `Fixture`
    .requestHooks([new RequestHook1(), new RequestHook2()]);

test.
    requestHooks(new RequestHook3())
    ('test', async t => {});

import { RequestHook } from 'testcafe';

const pageUrl = 'http://localhost:3000/fixtures/api/es-next/request-hooks/pages/index.html';

class Hook1 extends RequestHook {
    constructor () {
        super(pageUrl);
    }
}

class Hook2 extends RequestHook {
    constructor () {
        super(pageUrl);
    }

    async onRequest () {}
}

class Hook3 extends RequestHook {
    constructor () {
        super(pageUrl);
    }

    async onResponse () {
        throw new Error('Unhandled error.');
    }
}

const hook1 = new Hook1();
const hook2 = new Hook2();
const hook3 = new Hook3();

fixture `Fixture`
    .requestHooks(hook1, hook2, hook3);

test('test', async t => {
    await t.navigateTo(pageUrl);
});

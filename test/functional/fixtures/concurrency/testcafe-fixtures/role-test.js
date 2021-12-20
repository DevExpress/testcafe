/* eslint-disable no-shadow */
import {
    ClientFunction, Role, Selector, t,
} from 'testcafe';

const setAuthCookie = ClientFunction(auth => {
    return new Promise(resolve => {
        document.cookie = `demo_auth=${auth}; path=/`;
        resolve();
    });
});

const roleWrapper = USER => {
    return Role(
        'https://en.wikipedia.org/',
        async () => {
            await setAuthCookie(USER.auth);
            await t.eval(() => window.location.reload());
            await t.expect(Selector('.mp-topbanner').exists).notOk();
        },
        t,
        { preserveUrl: false, USER },
    );
};

const DEMO_ROLE = roleWrapper({ auth: '123456' });

fixture`F1`
    .page('https://en.wikipedia.org/wiki/United_States')
    .beforeEach(async t => {
        await t.useRole(DEMO_ROLE).wait(1000);
    });

test('T1', async t => {
    const location = await t.eval(() => window.location.pathname);

    await t.expect(location).eql('/wiki/United_States');
});

fixture`F2`
    .page('https://en.wikipedia.org/wiki/Canada')
    .beforeEach(async t => {
        await t.useRole(DEMO_ROLE).wait(1000);
    });

test('T2', async t => {
    const location = await t.eval(() => window.location.pathname);

    await t.expect(location).eql('/wiki/Canada');
});

import { Role } from 'testcafe';

const pageAddr = 'http://localhost:3000/fixtures/regression/gh-7874/';

const role1 = Role(pageAddr, async t => {
    await t.click('button');

    await t.setCookies({ inRole1: 'val' });
});

const role2 = Role(pageAddr, async t => {
    await t.setCookies({ inRole2: 'val' });
});

const getCookies = async (t) => (await t.getCookies()).map(cookie => cookie.name).sort();

fixture('Should clear cookies between roles if page have not been changed')
    .page(pageAddr)
    .beforeEach(async (t) => {
        await t.setCookies({ inHook: 'val' });

        const cookies = await getCookies(t);

        await t.expect(cookies).eql(['inHook']);

        await t.useRole(role1)
            .navigateTo(pageAddr);
    });


test('Test 1', async (t) => {
    const cookies1 = await getCookies(t);

    await t.expect(cookies1).eql([
        'inPage',
        'inRole1',
    ]);

    await t.useRole(role2);
    await t.eval(() => window.location.reload());

    const cookies2 = await getCookies(t);

    await t.expect(cookies2).eql([
        'inRole2',
    ]);
});

test('Test 2', async (t) => {
    const cookies1 = await getCookies(t);

    await t.expect(cookies1).eql([
        'inPage',
        'inRole1',
    ]);

    await t.useRole(Role.anonymous());

    const cookies2 = await getCookies(t);

    await t.expect(cookies2).eql([]);
});


test('Test 3', async (t) => {
    const cookies = await getCookies(t);

    await t.expect(cookies).eql([
        'inPage',
        'inRole1',
    ]);
});

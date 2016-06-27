fixture `Run all`
    .page `http://localhost:3000/fixtures/api/es-next/before-after-each-hooks/pages/index.html`
    .beforeEach(async t => await t.click('#beforeEach'))
    .afterEach(async t => {
        await t
            .click('#afterEach')
            .click('#failAndReport');
    });

test('Test1', async t => await t.click('#test'));
test('Test2', async t => await t.click('#test'));

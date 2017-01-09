fixture `Run all`
    .page `http://localhost:3000/fixtures/api/es-next/hooks/pages/index.html`
    .beforeEach(async t => {
        await t.click('#beforeEach');
    })
    .afterEach(async t => {
        await t
            .click('#afterEach')
            .click('#failAndReport');
    });

test('Test1', async t => {
    await t.click('#test');
});

test('Test2', async t => {
    await t.click('#test');
});

test
    .before(async t => {
        await t.click('#testBefore');
    })
    ('Test3', async t => {
        await t.click('#test');
    })
    .after(async t => {
        await t
            .click('#testAfter')
            .click('#failAndReport');
    });

test
    .before(async t => {
        t.ctx.val = {
            browsers: [],
            steps:    []
        };

        t.ctx.val.browsers.push(await t.eval(()=>navigator.userAgent));
        t.ctx.val.steps.push('before');
    })
    ('t.ctx', async t => {
        // NOTE: check that context is correctly exposed in chained calls
        const ctx = t.click('#test').ctx;

        ctx.val.browsers.push(await t.eval(()=>navigator.userAgent));
        ctx.val.steps.push('test');
    })
    .after(async t => {
        t.ctx.val.browsers.push(await t.eval(()=>navigator.userAgent));
        t.ctx.val.steps.push('after');

        var val = t.ctx.val;

        t.ctx = 123;

        throw `###${JSON.stringify({ val, ctx: t.ctx })}###`;
    });

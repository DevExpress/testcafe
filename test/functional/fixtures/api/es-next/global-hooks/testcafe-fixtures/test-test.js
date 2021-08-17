fixture`Fixture 1`
    .page`http://localhost:3000/fixtures/api/es-next/global-hooks/pages/index.html`;

test('Test1', async t => {
    await t
        .click('#test')
        .expect(t.fixtureCtx.testBefore).eql(1)
        .expect(t.fixtureCtx.testAfter).eql(0);
});

test('Test1', async t => {
    await t
        .click('#test')
        .expect(t.fixtureCtx.testBefore).eql(2)
        .expect(t.fixtureCtx.testAfter).eql(1);
});

test
    .before(async (t) => {
        await t
            .expect(t.ctx.testBefore).eql(1)
            .expect(t.ctx.testAfter).eql(0);

        t.ctx.testBefore++;
    })
    ('Test2', async t => {
        await t
            .click('#test')
            .expect(t.ctx.testBefore).eql(2)
            .expect(t.ctx.testAfter).eql(0);
    })
    .after(async (t) => {
        await t
            .expect(t.ctx.testBefore).eql(2)
            .expect(t.ctx.testAfter).eql(1);

        t.ctx.testAfter++;
    });

fixture`Fixture2`
    .page`http://localhost:3000/fixtures/api/es-next/global-hooks/pages/index.html`
    .beforeEach(async (t) => {
        await t
            .expect(t.ctx.testBefore).eql(1)
            .expect(t.ctx.testAfter).eql(0);

        t.ctx.testBefore++;
    })
    .afterEach(async (t) => {
        await t
            .expect(t.ctx.testBefore).eql(2)
            .expect(t.ctx.testAfter).eql(1);

        t.ctx.testAfter++;
    });

test('Test2', async t => {
    await t
        .click('#test')
        .expect(t.ctx.testBefore).eql(2)
        .expect(t.ctx.testAfter).eql(0);
});

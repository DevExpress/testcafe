fixture`FixtureName1`
    .page`http://localhost:3000/fixtures/api/es-next/test-info/pages/index.html`
    .meta({fixtureMeta: 'v'})

const fixtureInfo = {
    name: 'FixtureName1',
    meta: {fixtureMeta: 'v'},
    path: __filename,
}
const testInfo = {
    name: 'Test hooks',
    meta: {testMeta: 'v'}
}
test('Test hooks', async t => {})
    .meta({testMeta: 'v'})
    .before(async t => {
        await t
            .expect(t.fixture).eql(fixtureInfo)
            .expect(t.test).eql(testInfo);
    })
    .after(async t => {
        await t
            .expect(t.fixture).eql(fixtureInfo)
            .expect(t.test).eql(testInfo);
    })

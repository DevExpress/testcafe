import path from 'path';

const fixtureInfo = {
    name: 'FixtureName1',
    meta: { fixtureMeta: 'v' },
    path: path.resolve('./test/functional/fixtures/api/es-next/test-info/testcafe-fixtures/test-hooks.js'),
};
const testInfo    = {
    name: 'Test hooks',
    meta: { testMeta: 'v' },
};

fixture`FixtureName1`
    .page`http://localhost:3000/fixtures/api/es-next/test-info/pages/index.html`
    .meta({ fixtureMeta: 'v' });
test('Test hooks', () => {
})
    .meta({ testMeta: 'v' })
    .before(async t => {
        await t
            .expect(t.fixture).eql(fixtureInfo)
            .expect(t.test).eql(testInfo);
    })
    .after(async t => {
        await t
            .expect(t.fixture).eql(fixtureInfo)
            .expect(t.test).eql(testInfo);
    });

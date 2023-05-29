import {expect} from 'chai';

const fixtureInfo = {
    name: 'FixtureName',
    meta: {fixtureMeta: 'v'},
    path: __filename,
}
const testInfo = {
    name: 'Fixture hooks',
    meta: {testMeta: 'v'}
}

async function expectTestControllerInfo(t) {
    await t
        .expect(t.fixture).eql(fixtureInfo)
        .expect(t.test).eql(testInfo);
}

async function expectCtxTestInfo(_, {test, fixture}) {
    expect(fixture).eql(fixtureInfo)
    expect(test).eql(testInfo);
}

fixture`FixtureName`
    .meta({fixtureMeta: 'v'})
    .page`http://localhost:3000/fixtures/api/es-next/test-info/pages/index.html`
    .before(expectCtxTestInfo)
    .after(expectCtxTestInfo)
    .beforeEach(expectTestControllerInfo)
    .afterEach(expectTestControllerInfo)

test.meta({'testMeta': 'v'})('Fixture hooks', expectTestControllerInfo);

import { expect } from 'chai';
import path from 'path';

const fixtureInfo = {
    name: 'FixtureName',
    meta: { fixtureMeta: 'v' },
    path: path.resolve('./test/functional/fixtures/api/es-next/test-info/testcafe-fixtures/fixture-hooks.js'),
};
const testInfo    = {
    name: 'Fixture hooks',
    meta: { testMeta: 'v' },
};

const expectTestHookInfo    = async t => await t.expect(t.fixture).eql(fixtureInfo).expect(t.test).eql(testInfo);
const expectFixtureHookInfo = (_, info) => expect(info).eql(fixtureInfo);

fixture`FixtureName`
    .meta({ fixtureMeta: 'v' })
    .page`http://localhost:3000/fixtures/api/es-next/test-info/pages/index.html`
    .before(expectFixtureHookInfo)
    .after(expectFixtureHookInfo)
    .beforeEach(expectTestHookInfo)
    .afterEach(expectTestHookInfo);

test.meta({ 'testMeta': 'v' })('Fixture hooks', expectTestHookInfo);

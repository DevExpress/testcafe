import { ClientFunction } from 'testcafe';

fixture `Fixture`
    .clientScripts({ content: 'window["test"] = 0;' });

const getTestValue = ClientFunction(() => window['test']);

test('test', async t => {
    await t.expect(getTestValue()).eql(1);
}).clientScripts({ content: 'window["test"] = 1;' });

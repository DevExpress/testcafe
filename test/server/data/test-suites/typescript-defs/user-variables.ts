/// <reference path="../../../../../ts-defs/index.d.ts" />
import { userVariables } from 'testcafe';

fixture `UserVariables`;

test('test', async (t) => {
    const { url, port, isUserVariables } = userVariables;

    await t.expect(url).eql('localhost');
    await t.expect(port).eql(1337);
    await t.expect(isUserVariables).eql(true);
});

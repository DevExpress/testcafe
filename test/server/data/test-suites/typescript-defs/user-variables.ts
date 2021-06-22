/// <reference path="../../../../../ts-defs/index.d.ts" />
import { userVariables } from 'testcafe';
import { expect } from 'chai';

fixture `UserVariables`;

test('test', async () => {
    const { url, port, isUserVariables } = userVariables;

    expect(url).equal('localhost');
    expect(port).equal(1337);
    expect(isUserVariables).equal(true);
});

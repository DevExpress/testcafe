/// <reference path="../../../../../ts-defs/index.d.ts" />
import { UserConfig } from 'testcafe';
import { expect } from 'chai';

fixture `UserConfig`;

// eslint-disable-next-line no-only-tests/no-only-tests
test.only('test', async () => {
    const { url, port, isUserConfig } = UserConfig;

    expect(url).equal('localhost');
    expect(port).equal(1337);
    expect(isUserConfig).equal(true);
});

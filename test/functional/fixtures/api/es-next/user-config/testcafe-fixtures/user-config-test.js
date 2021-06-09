import { UserConfig } from 'testcafe';
import { expect } from 'chai';

fixture `UserConfig.access`;

test('test', () => {
    const { url, port, isUserConfig } = UserConfig;

    expect(url).equal('localhost');
    expect(port).equal(1337);
    expect(isUserConfig).equal(true);
});

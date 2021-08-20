import { userVariables } from 'testcafe';

fixture `UserVariables read access`;

test('test', async (t) => {
    const { url, port, isUserVariables } = userVariables;

    await t
        .expect(url).eql('localhost')
        .expect(port).eql(1337)
        .expect(isUserVariables).eql(true);
});

import dep2Fn from './dep2';

fixture('Fixture3')
    .page `https://example.com`
    .afterEach(() => 'yo')
    .beforeEach(() => 'yo');

test('Fixture3Test1', async () => {
    var res = await dep2Fn();

    return `F3T1: ${res}`;
});

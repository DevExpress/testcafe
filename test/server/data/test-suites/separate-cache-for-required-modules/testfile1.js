import dep1Fn from './dep1';
import dep2Fn from './node_modules/dep2';

fixture('Fixture1');

test('Fixture1Test1', async () => {
    const noncached = await dep1Fn();
    const cached    = await dep2Fn();

    return { noncached, cached };
});

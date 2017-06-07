import 'testcafe';
import dep1 from './dep1';
import dep2 from './dep2';

fixture `Some fixture`;

test('Test deps', async() => {
    return [await dep1(2), await dep2(2)];
});

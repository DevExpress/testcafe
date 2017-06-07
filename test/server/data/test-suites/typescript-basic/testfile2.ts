import 'testcafe';
import dep2Fn from './dep2';

fixture `Fixture3`
    .page `https://example.com`
    .afterEach(async() => 'yo')
    .beforeEach(async() => 'yo');

const fixture3Name = 'Fixture3Test1';

test(fixture3Name, async() => {
    var res = await dep2Fn();

    return `F3T1: ${res}`;
});

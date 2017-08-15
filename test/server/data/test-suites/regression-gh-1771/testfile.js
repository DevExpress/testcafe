import { Selector } from 'testcafe';

const CustomSelector = Selector().addCustomMethods();

fixture `Fixture`
    .page('http://page');

test('Test', async t => {

});

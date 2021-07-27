import { Selector, t } from 'testcafe';

fixture('DevExpress/testcafe/issues/6405')
    .page('https://www.my.eloan.com/apply');

test('test 1', async t => {
    console.log('here');
    console.log('here 1');
})


test('test 2', async t => {
    console.log('here');
    await t.pressKey('tab');
    console.log('here 1');
})

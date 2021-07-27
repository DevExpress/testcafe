import { Selector, t } from 'testcafe';

fixture('DevExpress/testcafe/issues/6405')
    .page('https://www.my.eloan.com/apply');

test('test 1', async t => {
    console.log('here');
    console.log('here 1');
})


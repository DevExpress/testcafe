import { Selector } from 'testcafe';

fixture `File protocol iframe`
    .page('../pages/index.html');

for (let i = 0; i < 10; i++) {
    test(`File protocol iframe ${i}`, async t => {
        await t.switchToIframe('iframe');

        await t.expect(Selector('div').innerText).eql('content');
    });

}

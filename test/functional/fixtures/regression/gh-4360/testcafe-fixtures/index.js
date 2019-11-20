import { Selector } from 'testcafe';

fixture `GH-4360 - Should not throw 'contextStorage is undefined' error`
    .page `http://localhost:3000/fixtures/regression/gh-4360/pages/index.html`;

test(`Submit form in iframe immediately after load`, async t => {
    await t
        .wait(500)
        .switchToIframe('iframe');
    await t.expect(Selector('#target').innerText).eql('OK');
});

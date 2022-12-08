import { Selector } from 'testcafe';

fixture `Message Event`
    .page('http://localhost:3000/fixtures/api/es-next/iframe-switching/pages/message-event/index.html');

test('test', async t => {
    await t
        .click('#post-string-message')
        .click('#post-object-message')
        .expect(Selector('#received-log').innerText).eql('"string message processed"\n{"object":"message","processed":true}')
        .switchToIframe('#cross-domain-iframe')
        .expect(Selector('#received-log').innerText).eql('"string message"\n{"object":"message"}')
        .typeText('#input', 'Text')
        .expect(Selector('#input').value).eql('Text')
        .switchToMainWindow();
});

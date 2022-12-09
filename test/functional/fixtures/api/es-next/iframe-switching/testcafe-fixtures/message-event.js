import { Selector } from 'testcafe';

fixture `Message Event`
    .page('http://localhost:3000/fixtures/api/es-next/iframe-switching/pages/message-event/index.html');

test('test', async t => {
    const receivedLog = Selector('#received-log').addCustomDOMProperties({
        trimmedInnerText: el => el.innerText.replace('\n', ''),
    });

    await t
        .click('#post-string-message')
        .click('#post-object-message')
        .expect(receivedLog.trimmedInnerText).eql('"string message processed"{"object":"message","processed":true}')
        .switchToIframe('#cross-domain-iframe')
        .expect(receivedLog.trimmedInnerText).eql('"string message"{"object":"message"}')
        .typeText('#input', 'Text')
        .expect(Selector('#input').value).eql('Text')
        .switchToMainWindow();
});

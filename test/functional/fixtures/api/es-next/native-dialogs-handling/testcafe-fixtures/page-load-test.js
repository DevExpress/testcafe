import { ClientFunction } from 'testcafe';

fixture`Page load`;


const getResult = ClientFunction(() => window.getDialogsResult());
const pageUrl   = 'http://localhost:3000/fixtures/api/es-next/native-dialogs-handling/pages/page-load.html';


test('Expected dialogs after page load', async t => {
    await t
        .setNativeDialogHandler((type, text) => {
            if (type === 'confirm' && text === 'Confirm?')
                return true;

            if (type === 'prompt')
                return 'PromptMsg';

            if (type === 'geolocation')
                return { geo: 'location' };

            return null;
        })
        .navigateTo(pageUrl);

    await t.expect(await getResult()).eql({
        prompt:      'PromptMsg',
        confirm:     'true',
        geolocation: '{"geo":"location"}',
    });

    const info = await t.getNativeDialogHistory();

    await t.expect(info).eql([
        {
            type: 'geolocation',
            url:  pageUrl,
        },
        {
            type: 'print',
            url:  pageUrl,
        },
        {
            type: 'prompt',
            text: 'Prompt',
            url:  pageUrl,
        },
        {
            type: 'confirm',
            text: 'Confirm?',
            url:  pageUrl,
        },
        {
            type: 'alert',
            text: 'Alert!',
            url:  pageUrl,
        },
    ]);
});

test
    .page(pageUrl)
    ('Unexpected alert after page load', async t => {
        await t.click('body');
    });

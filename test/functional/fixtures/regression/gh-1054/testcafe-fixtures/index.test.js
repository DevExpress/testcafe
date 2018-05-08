import { ClientFunction, Selector } from 'testcafe';
import userAgent from 'useragent';

fixture `Check the target element value when the first input event raised`
    .page('http://localhost:3000/fixtures/regression/gh-1054/pages/index.html');


const getFirstValue = ClientFunction(() => window.storedValue);
const getUserAgent  = ClientFunction(() => navigator.userAgent);

test('Type text in the input', async t => {
    await t
        .typeText('input', 'text', { replace: true })
        .expect(Selector('input').value).eql('text');

    await t.expect(await getFirstValue()).eql('t');
});

test('Type text in the content editable element', async t => {
    await t
        .typeText('div', 'text', { replace: true })
        .expect(Selector('div').textContent).eql('text');

    var userAgentStr = await getUserAgent();
    var isIE         = userAgent.is(userAgentStr).ie;

    if (!isIE)
        await t.expect(await getFirstValue()).eql('t');
});

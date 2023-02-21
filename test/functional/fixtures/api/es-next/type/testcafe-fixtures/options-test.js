import { getInputValue, setInputValue } from '../common/utils.js';

fixture `Options`
    .page('http://localhost:3000/fixtures/api/es-next/type/pages/options.html');

test('Replace', async t => {
    await setInputValue('old text');

    await t
        .typeText('#input', 'new text', { replace: true })
        .expect(getInputValue()).eql('new text');
});



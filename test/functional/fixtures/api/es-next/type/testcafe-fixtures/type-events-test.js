import { getEventLog, getInputValue } from '../common/utils.js';

fixture `Type in various controls`
    .page `http://localhost:3000/fixtures/api/es-next/type/pages/events.html`;

test('Type text events', async t => {
    await t
        .typeText('#input', 'HI')
        .expect(getInputValue()).eql('HI')
        .expect(getEventLog()).eql('click; keydown: H; keypress: H; keyup: H; keydown: I; keypress: I; keyup: I;');
});

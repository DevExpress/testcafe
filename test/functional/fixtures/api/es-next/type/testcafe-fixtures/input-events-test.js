import { getEventLog } from '../common/utils.js';

fixture `Input events`
    .page `http://localhost:3000/fixtures/api/es-next/type/pages/input-events.html`;

test('Input events', async t => {
    await t
        .typeText('#input', '123')
        .expect(getEventLog()).eql('beforeinput: 1; textInput: 1; input: 1; beforeinput: 2; textInput: 2; input: 2; beforeinput: 3; textInput: 3; input: 3;');
});

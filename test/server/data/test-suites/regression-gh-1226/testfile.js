import help from './helper.js';

fixture `Test`
    .page `http://example.com`;

test('test', async t => {
    await help(t);
});

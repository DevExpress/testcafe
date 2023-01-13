import { Selector } from 'testcafe';

fixture('Fixture').page('../pages/index.html');

test('Test', async t => {
    const rectElement = Selector('div').shadowRoot().find('rect');

    await t.click(rectElement);
});

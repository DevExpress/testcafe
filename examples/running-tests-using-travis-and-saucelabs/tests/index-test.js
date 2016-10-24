import { expect } from 'chai';

fixture `Check if the button text changes`
    .page `http://localhost:9090/index.html`;

test('My test', async t => {
    await t
		.click('#click-here');

    const button = await t.select('#click-here');

    expect(button.value).to.equal('Hello!');
});

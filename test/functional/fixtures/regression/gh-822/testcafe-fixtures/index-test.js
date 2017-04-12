import { expect } from 'chai';
import { Selector } from 'testcafe';

fixture `gh822`
    .page `http://localhost:3000/fixtures/regression/gh-822/pages/index.html`;

test('Selectors with escapable symbols', async () => {
    const div = await Selector('#\\35 -2')();

    expect(div.innerText).eql('1');
});

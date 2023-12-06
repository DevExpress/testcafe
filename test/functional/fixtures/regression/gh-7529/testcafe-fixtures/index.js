import {Selector} from 'testcafe'

fixture `Regression GH-7529`
    .page `http://localhost:3000/fixtures/regression/gh-7529/`

test('Decode page in native automation mode', async t => {
    const title = await Selector('h1').textContent;

    await t.expect(title).eql('codage réussi')
})
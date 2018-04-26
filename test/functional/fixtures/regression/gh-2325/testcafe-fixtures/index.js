import { Selector } from 'testcafe';

fixture `GH-2325 - Simulate screenX and screenY properties of event`
    .page `http://localhost:3000/fixtures/regression/gh-2325/pages/index.html`;

const drag   = Selector('#drag');
const target = Selector('#target');
const result = Selector('#result');

test('Drag an element to the right bottom corner and check screenX/screenY', async t => {
    await t
        .expect(result.textContent).eql('screenX or screenY do not work')
        .dragToElement(drag, target, { speed: 0.5 })
        .expect(result.textContent).eql('It works');
});

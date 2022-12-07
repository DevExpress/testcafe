import actual from '../actual.js';

fixture `Define hooks of the first fixture`
    .page `http://localhost:3000/fixtures/regression/gh-3298/pages/index.html`
    .before(async () => {
        actual.add('1 begin before');
        await new Promise(resolve => setTimeout(resolve, 100));
        actual.add('1 end before');
    })
    .after(async () => {
        actual.add('1 begin after');
        await new Promise(resolve => setTimeout(resolve, 100));
        actual.add('1 end after');

        actual.save();
    });


test('Execute test 1', async () => {
    actual.add('1');
});

fixture `Define hooks of the second fixture`
    .page `http://localhost:3000/fixtures/regression/gh-3298/pages/index.html`
    .before(async () => {
        actual.add('2 begin before');
        await new Promise(resolve => setTimeout(resolve, 100));
        actual.add('2 end before');
    })
    .after(async () => {
        actual.add('2 begin after');
        await new Promise(resolve => setTimeout(resolve, 100));
        actual.add('2 end after');

        actual.save();
    });


test('Execute test 2', async () => {
    actual.add('2');
});

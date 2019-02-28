import { actual } from '../actual';

fixture `Define hooks of the first fixture`
    .page `http://localhost:3000/fixtures/regression/gh-3298/pages/index.html`
    .before(async () => {
        actual.push('1 begin before');
        await new Promise(resolve => setTimeout(resolve, 100));
        actual.push('1 end before');
    })
    .after(async () => {
        actual.push('1 begin after');
        await new Promise(resolve => setTimeout(resolve, 100));
        actual.push('1 end after');
    });


test('Execute test 1', async () => {
    actual.push('1');
});

fixture `Define hooks of the second fixture`
    .page `http://localhost:3000/fixtures/regression/gh-3298/pages/index.html`
    .before(async () => {
        actual.push('2 begin before');
        await new Promise(resolve => setTimeout(resolve, 100));
        actual.push('2 end before');
    })
    .after(async () => {
        actual.push('2 begin after');
        await new Promise(resolve => setTimeout(resolve, 100));
        actual.push('2 end after');
    });


test('Execute test 2', async () => {
    actual.push('2');
});

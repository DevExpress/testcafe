// NOTE: to preserve callsites, add new tests AFTER the existing ones

fixture `Driver`
    .page `http://localhost:3000/driver/pages/page1.html`;

function wait (ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

test('Click and wait for page unloading', async t => {
    await t.click('#link');
    await wait(1000);
    await t.click('#btn');
});

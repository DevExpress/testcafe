fixture `Error on page load`
    .page `http://localhost:3000/page-js-errors/es-next/pages/error-on-load.html`;

async function wait (ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

test('Empty test', async () => {
    await wait(100);
});

test('Click body', async t => {
    await t.click('body', { offsetX: 0, offsetY: 0 });
});

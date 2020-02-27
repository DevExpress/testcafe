fixture `Fixture 1`
    .page `http://localhost:3000/fixtures/regression/gh-4787/pages/index.html`;

for (let i = 0; i < 5; i++) {
    test('Test 1', async t => {
        await t.wait(1000);
    });
}

fixture `Fixture 2`
    .page `http://localhost:3000/fixtures/regression/gh-4787/pages/index.html`;

for (let i = 0; i < 5; i++) {
    test('Test 2', async t => {
        await t.wait(1000);
    });
}

fixture `Fixture 3`
    .page `http://localhost:3000/fixtures/regression/gh-4787/pages/index.html`;

for (let i = 0; i < 5; i++) {
    test('Test 3', async t => {
        await t.wait(1000);
    });
}

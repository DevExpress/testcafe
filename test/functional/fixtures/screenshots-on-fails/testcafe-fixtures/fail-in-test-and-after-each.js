fixture `Fail in test and afterEach`
    .page `http://localhost:3000/fixtures/screenshots-on-fails/pages/index.html`
    .afterEach(() => {
        throw new Error('Fail in afterEach');
    });

test('Screenshots on afterEach and test errors', () => {
    throw new Error('Fail in test');
});

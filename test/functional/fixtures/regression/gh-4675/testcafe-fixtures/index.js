fixture `GH-4675 - Should raise an error if several reporters are going to write to the stdout`
    .page `http://localhost:3000/fixtures/regression/gh-4675/pages/index.html`;

test(`Dummy`, async () => {
});

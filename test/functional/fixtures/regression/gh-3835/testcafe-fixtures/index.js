fixture `Should not stop while async report methods are executing (GH-3835)`
    .page `http://localhost:3000/fixtures/regression/gh-3835/pages/index.html`;

test(`Custom async reporters with delay`, async () => {
});

fixture`FixtureName2`
    .meta({ fixtureMeta: 'v' })
    .page`http://localhost:3000/fixtures/api/es-next/test-info/pages/index.html`;

test.meta({ 'testMeta': 'v' })('Runner hooks', () => {
});

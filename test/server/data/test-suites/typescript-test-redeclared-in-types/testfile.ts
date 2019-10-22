fixture(`TestController`)
    .page(`http://localhost:3000/fixtures/api/es-next/assertions/pages/index.html`);

test('.eql() assertion', async t => {
    await t
        .expect({a: 2}).eql({a: 2})
        .expect('hey').eql('yo', 'testMessage');
});

fixture `Should set cookie with the \`httpOnly\` option`
    .page `http://localhost:3000/fixtures/regression/gh-7793/pages/index.html`;

test('Should set cookies with the `httpOnly` option', async t => {
    const cookieObject = { name: 'apiCookie1', value: 'value1', domain: 'localhost', httpOnly: true };

    await t.setCookies(cookieObject);

    const cookies = await t.getCookies();

    await t
        .expect(cookies.length).eql(1)
        .expect(cookies[0]).contains(cookieObject);
});

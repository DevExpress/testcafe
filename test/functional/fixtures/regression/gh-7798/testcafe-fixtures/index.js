fixture('Should retrieve a cookie with the specified url')
    .page('http://localhost:3000/fixtures/regression/gh-7798/pages/index.html');

test('Should retrieve a cookie with the specified url', async t => {
    await t.setCookies({ name: 'apiCookie1', value: 'value1' });

    let cookies = await t.getCookies();

    await t.expect(cookies.length).eql(1);
    await t.expect(cookies[0].name).eql('apiCookie1');

    cookies = await t.getCookies(['apiCookie1']);

    await t.expect(cookies.length).eql(1);
    await t.expect(cookies[0].name).eql('apiCookie1');

    cookies = await t.getCookies(['apiCookie1'], ['http://localhost:3000/fixtures/regression/gh-7798/pages/index.html']);

    await t.expect(cookies.length).eql(1);
    await t.expect(cookies[0].name).eql('apiCookie1');

    cookies = await t.getCookies(['apiCookie2']);

    await t.expect(cookies.length).eql(0);

    await t.setCookies({ name: 'apiCookie2', value: 'value2' }, 'http://localhost:3000/custom');
    cookies = await t.getCookies(['apiCookie1', 'apiCookie2']);

    await t.expect(cookies.length).eql(2);

    cookies = await t.getCookies(['apiCookie1', 'apiCookie2'], ['http://localhost:3000/custom', 'http://localhost:3000/fixtures/regression/gh-7798/pages/index.html']);

    await t.expect(cookies.length).eql(2);

    cookies = await t.getCookies(['apiCookie1', 'apiCookie2'], 'http://localhost:3000/custom');

    await t.expect(cookies.length).eql(1);
    await t.expect(cookies[0].name).eql('apiCookie2');

    cookies = await t.getCookies(['apiCookie2'], ['http://localhost:3000/custom', 'http://localhost:3000/fixtures/regression/gh-7798/pages/index.html']);

    await t.expect(cookies.length).eql(1);
    await t.expect(cookies[0].name).eql('apiCookie2');
});

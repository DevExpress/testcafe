import { ClientFunction } from 'testcafe';

fixture`[API] Get Cookies`
    .page('http://localhost:3000/fixtures/api/es-next/cookies/pages/index.html')
    .beforeEach(async t => {
        await t
            .setCookies([
                { name: 'apiCookie1', value: 'value1', domain: 'domain1.com', path: '/' },
                { name: 'apiCookie1', value: 'value1', domain: 'domain2.com', path: '/' },
                { name: 'apiCookie2', value: 'value2', domain: 'domain2.com', path: '/' },
                { name: 'apiCookie3', value: 'value3', domain: 'domain2.com', path: '/path-1' },
                { name: 'apiCookie4', value: 'value4', domain: 'domain1.com', path: '/path-2' },
                { name: 'apiCookie5', value: 'value5', domain: 'domain2.com', path: '/path-1' },
            ]);
    });

const getClientCookie = ClientFunction(() => {
    return document.cookie;
});

test('Should get cookies by name', async t => {
    const expectedCookies = [
        {
            'name':     'apiCookie1',
            'value':    'value1',
            'domain':   'domain1.com',
            'path':     '/',
            'expires':  void 0,
            'maxAge':   void 0,
            'secure':   false,
            'httpOnly': false,
            'sameSite': 'none',
        },
        {
            'name':     'apiCookie1',
            'value':    'value1',
            'domain':   'domain2.com',
            'path':     '/',
            'expires':  void 0,
            'maxAge':   void 0,
            'secure':   false,
            'httpOnly': false,
            'sameSite': 'none',
        },
    ];

    const cookies = await t.getCookies('apiCookie1');

    await t.expect(expectedCookies).eql(cookies);
});

test('Should get cookies by objects', async t => {
    const expectedCookies = [
        {
            'name':     'apiCookie1',
            'value':    'value1',
            'domain':   'domain1.com',
            'path':     '/',
            'expires':  void 0,
            'maxAge':   void 0,
            'secure':   false,
            'httpOnly': false,
            'sameSite': 'none',
        },
        {
            'name':     'apiCookie1',
            'value':    'value1',
            'domain':   'domain2.com',
            'path':     '/',
            'expires':  void 0,
            'maxAge':   void 0,
            'secure':   false,
            'httpOnly': false,
            'sameSite': 'none',
        },
        {
            'name':     'apiCookie1',
            'value':    'value1',
            'domain':   'domain2.com',
            'path':     '/',
            'expires':  void 0,
            'maxAge':   void 0,
            'secure':   false,
            'httpOnly': false,
            'sameSite': 'none',
        },
        {
            'name':     'apiCookie2',
            'value':    'value2',
            'domain':   'domain2.com',
            'path':     '/',
            'expires':  void 0,
            'maxAge':   void 0,
            'secure':   false,
            'httpOnly': false,
            'sameSite': 'none',
        },
    ];
    const cookies         = await t.getCookies(
        { name: 'apiCookie1' },
        [{ domain: 'domain2.com', path: '/' }]);

    await t.expect(expectedCookies).eql(cookies);
});

fixture`[API] Set Cookies`
    .page('http://localhost:3000/fixtures/api/es-next/cookies/pages/index.html');

test('Should set cookies by object with default url', async t => {
    const expectedCookies = [
        {
            domain:   'localhost',
            expires:  void 0,
            httpOnly: false,
            maxAge:   void 0,
            name:     'apiCookie13',
            path:     '/fixtures/api/es-next/cookies/pages/index.html',
            sameSite: 'none',
            secure:   false,
            value:    'value13',
        },
    ];


    await t.setCookies({ name: 'apiCookie13', value: 'value13' });

    const cookies = await t.getCookies();

    await t.expect(cookies).eql(expectedCookies);
});

test('Should set cookies by key-value', async t => {
    const expectedCookies = [
        {
            domain:   'localhost',
            expires:  void 0,
            httpOnly: false,
            maxAge:   void 0,
            name:     'apiCookie1',
            path:     '/',
            sameSite: 'none',
            secure:   false,
            value:    'value1',
        },
    ];

    await t.setCookies({ apiCookie1: 'value1' }, 'http://localhost');

    const cookies = await t.getCookies();

    await t.expect(cookies).eql(expectedCookies);
});

test('Should set on the client', async (t) => {
    await t.expect(getClientCookie()).eql('');
    await t.setCookies({ name: 'apiCookie13', value: 'value13' });

    await t.expect(getClientCookie()).eql('apiCookie13=value13');
});

fixture`[API] Delete Cookies`
    .page('http://localhost:3000/fixtures/api/es-next/cookies/pages/index.html')
    .beforeEach(async t => {
        await t
            .setCookies([
                { name: 'apiCookie1', value: 'value1', domain: 'domain1.com', path: '/' },
                { name: 'apiCookie1', value: 'value1', domain: 'localhost', path: '/fixtures/api/es-next/cookies/pages/index.html' },
                { name: 'apiCookie2', value: 'value2', domain: 'localhost', path: '/fixtures/api/es-next/cookies/pages/index.html' },
                { name: 'apiCookie3', value: 'value3', domain: 'domain2.com', path: '/path-1' },
                { name: 'apiCookie4', value: 'value4', domain: 'domain1.com', path: '/path-2' },
                { name: 'apiCookie5', value: 'value5', domain: 'domain2.com', path: '/path-1' },
            ]);
    });

test('Should delete cookies by names and url', async t => {
    await t.expect((await t.getCookies()).length).eql(6);
    await t.deleteCookies(['apiCookie1', 'apiCookie2'], 'https://localhost/fixtures/api/es-next/cookies/pages/index.html');

    const currentCookies = await t.getCookies();

    await t
        .expect(currentCookies.length).eql(4)
        .expect(currentCookies.some(c => c.name === 'apiCookie1' && c.domain === 'localhost')).notOk()
        .expect(currentCookies.some(c => c.name === 'apiCookie2' && c.domain === 'localhost')).notOk()
        .expect(currentCookies.some(c => c.name === 'apiCookie1' && c.domain === 'domain1.com')).ok();
});

test('Should delete cookies by objects', async t => {
    await t.expect((await t.getCookies()).length).eql(6);
    await t.deleteCookies(
        { name: 'apiCookie1' },
        [{ domain: 'domain2.com', path: '/path-1' }],
    );

    const currentCookies = await t.getCookies();

    await t
        .expect(currentCookies.length).eql(2)
        .expect(currentCookies.some(c => c.name === 'apiCookie1')).notOk()
        .expect(currentCookies.some(c => c.name === 'apiCookie3')).notOk()
        .expect(currentCookies.some(c => c.name === 'apiCookie5')).notOk();
});

test('Should delete on the client', async t => {
    await t.expect(getClientCookie()).eql('apiCookie1=value1; apiCookie2=value2');
    await t.deleteCookies({ domain: 'localhost', path: '/fixtures/api/es-next/cookies/pages/index.html' });
    await t.expect(getClientCookie()).eql('');
});

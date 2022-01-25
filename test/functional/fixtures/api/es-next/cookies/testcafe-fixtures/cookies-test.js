import { RequestLogger } from 'testcafe';


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
    })
    .afterEach(async t => {
        await t.deleteCookies();
    });

test('Should get all cookies', async t => {
    const expectedCookies = [
        {
            'name':     'apiCookie1',
            'value':    'value1',
            'domain':   'domain1.com',
            'path':     '/',
            'expires':  'Infinity',
            'maxAge':   null,
            'secure':   false,
            'httpOnly': false,
            'sameSite': 'none',
        },
        {
            'name':     'apiCookie1',
            'value':    'value1',
            'domain':   'domain2.com',
            'path':     '/',
            'expires':  'Infinity',
            'maxAge':   null,
            'secure':   false,
            'httpOnly': false,
            'sameSite': 'none',
        },
        {
            'name':     'apiCookie2',
            'value':    'value2',
            'domain':   'domain2.com',
            'path':     '/',
            'expires':  'Infinity',
            'maxAge':   null,
            'secure':   false,
            'httpOnly': false,
            'sameSite': 'none',
        },
        {
            'name':     'apiCookie3',
            'value':    'value3',
            'domain':   'domain2.com',
            'path':     '/path-1',
            'expires':  'Infinity',
            'maxAge':   null,
            'secure':   false,
            'httpOnly': false,
            'sameSite': 'none',
        },
        {
            'name':     'apiCookie4',
            'value':    'value4',
            'domain':   'domain1.com',
            'path':     '/path-2',
            'expires':  'Infinity',
            'maxAge':   null,
            'secure':   false,
            'httpOnly': false,
            'sameSite': 'none',
        },
        {
            'name':     'apiCookie5',
            'value':    'value5',
            'domain':   'domain2.com',
            'path':     '/path-1',
            'expires':  'Infinity',
            'maxAge':   null,
            'secure':   false,
            'httpOnly': false,
            'sameSite': 'none',
        },
    ];
    const cookies         = await t.getCookies();

    await t.expect(expectedCookies).eql(cookies);
});

test('Should get cookies by name', async t => {
    const expectedCookies = [
        {
            'name':     'apiCookie1',
            'value':    'value1',
            'domain':   'domain1.com',
            'path':     '/',
            'expires':  'Infinity',
            'maxAge':   null,
            'secure':   false,
            'httpOnly': false,
            'sameSite': 'none',
        },
        {
            'name':     'apiCookie1',
            'value':    'value1',
            'domain':   'domain2.com',
            'path':     '/',
            'expires':  'Infinity',
            'maxAge':   null,
            'secure':   false,
            'httpOnly': false,
            'sameSite': 'none',
        },
    ];
    const cookies         = await t.getCookies('apiCookie1');

    await t.expect(expectedCookies).eql(cookies);
});

test('Should get cookies by names', async t => {
    const expectedCookies = [
        {
            'name':     'apiCookie1',
            'value':    'value1',
            'domain':   'domain1.com',
            'path':     '/',
            'expires':  'Infinity',
            'maxAge':   null,
            'secure':   false,
            'httpOnly': false,
            'sameSite': 'none',
        },
        {
            'name':     'apiCookie1',
            'value':    'value1',
            'domain':   'domain2.com',
            'path':     '/',
            'expires':  'Infinity',
            'maxAge':   null,
            'secure':   false,
            'httpOnly': false,
            'sameSite': 'none',
        },
        {
            'name':     'apiCookie4',
            'value':    'value4',
            'domain':   'domain1.com',
            'path':     '/path-2',
            'expires':  'Infinity',
            'maxAge':   null,
            'secure':   false,
            'httpOnly': false,
            'sameSite': 'none',
        },
    ];
    const cookies         = await t.getCookies(['apiCookie1', 'apiCookie4']);

    await t.expect(expectedCookies).eql(cookies);
});

test('Should get cookies by name and url', async t => {
    const expectedCookies = [
        {
            'name':     'apiCookie4',
            'value':    'value4',
            'domain':   'domain1.com',
            'path':     '/path-2',
            'expires':  'Infinity',
            'maxAge':   null,
            'secure':   false,
            'httpOnly': false,
            'sameSite': 'none',
        },
    ];
    const cookies         = await t.getCookies('apiCookie4', 'https://domain1.com/path-2');

    await t.expect(expectedCookies).eql(cookies);
});

test('Should get cookies by names and url', async t => {
    const expectedCookies = [
        {
            'name':     'apiCookie3',
            'value':    'value3',
            'domain':   'domain2.com',
            'path':     '/path-1',
            'expires':  'Infinity',
            'maxAge':   null,
            'secure':   false,
            'httpOnly': false,
            'sameSite': 'none',
        },
        {
            'name':     'apiCookie5',
            'value':    'value5',
            'domain':   'domain2.com',
            'path':     '/path-1',
            'expires':  'Infinity',
            'maxAge':   null,
            'secure':   false,
            'httpOnly': false,
            'sameSite': 'none',
        },
    ];
    const cookies         = await t.getCookies(['apiCookie3', 'apiCookie5'], 'https://domain2.com/path-1');

    await t.expect(expectedCookies).eql(cookies);
});

test('Should get cookies by name and urls', async t => {
    const expectedCookies = [
        {
            'name':     'apiCookie1',
            'value':    'value1',
            'domain':   'domain1.com',
            'path':     '/',
            'expires':  'Infinity',
            'maxAge':   null,
            'secure':   false,
            'httpOnly': false,
            'sameSite': 'none',
        },
        {
            'name':     'apiCookie1',
            'value':    'value1',
            'domain':   'domain2.com',
            'path':     '/',
            'expires':  'Infinity',
            'maxAge':   null,
            'secure':   false,
            'httpOnly': false,
            'sameSite': 'none',
        },
    ];
    const cookies         = await t.getCookies('apiCookie1', ['https://domain1.com/', 'https://domain2.com/']);

    await t.expect(expectedCookies).eql(cookies);
});

test('Should get cookies by names and urls', async t => {
    const expectedCookies = [
        {
            'name':     'apiCookie1',
            'value':    'value1',
            'domain':   'domain1.com',
            'path':     '/',
            'expires':  'Infinity',
            'maxAge':   null,
            'secure':   false,
            'httpOnly': false,
            'sameSite': 'none',
        },
        {
            'name':     'apiCookie1',
            'value':    'value1',
            'domain':   'domain2.com',
            'path':     '/',
            'expires':  'Infinity',
            'maxAge':   null,
            'secure':   false,
            'httpOnly': false,
            'sameSite': 'none',
        },
        {
            'name':     'apiCookie2',
            'value':    'value2',
            'domain':   'domain2.com',
            'path':     '/',
            'expires':  'Infinity',
            'maxAge':   null,
            'secure':   false,
            'httpOnly': false,
            'sameSite': 'none',
        },
    ];
    const cookies         = await t.getCookies(['apiCookie1', 'apiCookie2'], ['https://domain1.com/', 'https://domain2.com/']);

    await t.expect(expectedCookies).eql(cookies);
});

test('Should get cookies by object with domain and path', async t => {
    const expectedCookies = [
        {
            'name':     'apiCookie1',
            'value':    'value1',
            'domain':   'domain1.com',
            'path':     '/',
            'expires':  'Infinity',
            'maxAge':   null,
            'secure':   false,
            'httpOnly': false,
            'sameSite': 'none',
        },
        {
            'name':     'apiCookie4',
            'value':    'value4',
            'domain':   'domain1.com',
            'path':     '/path-2',
            'expires':  'Infinity',
            'maxAge':   null,
            'secure':   false,
            'httpOnly': false,
            'sameSite': 'none',
        },
    ];
    const cookies         = await t.getCookies({ domain: 'domain1.com', path: '/path-2' });

    await t.expect(expectedCookies).eql(cookies);
});

test('Should get cookies by objects', async t => {
    const expectedCookies = [
        {
            'name':     'apiCookie1',
            'value':    'value1',
            'domain':   'domain1.com',
            'path':     '/',
            'expires':  'Infinity',
            'maxAge':   null,
            'secure':   false,
            'httpOnly': false,
            'sameSite': 'none',
        },
        {
            'name':     'apiCookie1',
            'value':    'value1',
            'domain':   'domain2.com',
            'path':     '/',
            'expires':  'Infinity',
            'maxAge':   null,
            'secure':   false,
            'httpOnly': false,
            'sameSite': 'none',
        },
        {
            'name':     'apiCookie1',
            'value':    'value1',
            'domain':   'domain2.com',
            'path':     '/',
            'expires':  'Infinity',
            'maxAge':   null,
            'secure':   false,
            'httpOnly': false,
            'sameSite': 'none',
        },
        {
            'name':     'apiCookie2',
            'value':    'value2',
            'domain':   'domain2.com',
            'path':     '/',
            'expires':  'Infinity',
            'maxAge':   null,
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
    .page('http://localhost:3000/fixtures/api/es-next/cookies/pages/index.html')
    .afterEach(async t => {
        await t.deleteCookies();
    });

test('Should set cookies by object', async t => {
    const expectedCookies = [
        {
            domain:   'some-another-domain.com',
            expires:  'Infinity',
            httpOnly: false,
            maxAge:   null,
            name:     'apiCookie13',
            path:     '/',
            sameSite: 'none',
            secure:   false,
            value:    'value13',
        },
    ];


    await t.setCookies({ name: 'apiCookie13', value: 'value13', domain: 'some-another-domain.com', path: '/' });

    const cookies = await t.getCookies();

    await t.expect(cookies).eql(expectedCookies);
});

test('Should set cookies by object with default url', async t => {
    const expectedCookies = [
        {
            domain:   'localhost',
            expires:  'Infinity',
            httpOnly: false,
            maxAge:   null,
            name:     'apiCookie13',
            path:     '/',
            sameSite: 'none',
            secure:   false,
            value:    'value13',
        },
    ];


    await t.setCookies({ name: 'apiCookie13', value: 'value13' });

    const cookies = await t.getCookies();

    await t.expect(cookies).eql(expectedCookies);
});

test('Should set cookies by objects', async t => {
    const expectedCookies = [
        {
            domain:   'some-another-domain.com',
            expires:  'Infinity',
            httpOnly: false,
            maxAge:   null,
            name:     'apiCookie13',
            path:     '/',
            sameSite: 'none',
            secure:   false,
            value:    'value13',
        },
        {
            domain:   'some-another-domain.com',
            expires:  'Infinity',
            httpOnly: false,
            maxAge:   null,
            name:     'apiCookie14',
            path:     '/',
            sameSite: 'none',
            secure:   false,
            value:    'value14',
        },
    ];

    await t.setCookies([
        { name: 'apiCookie13', value: 'value13', domain: 'some-another-domain.com', path: '/' },
        { name: 'apiCookie14', value: 'value14', domain: 'some-another-domain.com', path: '/' },
    ]);

    const cookies = await t.getCookies();

    await t.expect(cookies).eql(expectedCookies);
});

test('Should set cookies by key-value', async t => {
    const expectedCookies = [
        {
            domain:   'localhost',
            expires:  'Infinity',
            httpOnly: false,
            maxAge:   null,
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

test('Should set cookies by key-value with default url', async t => {
    const expectedCookies = [
        {
            domain:   'localhost',
            expires:  'Infinity',
            httpOnly: false,
            maxAge:   null,
            name:     'apiCookie1',
            path:     '/',
            sameSite: 'none',
            secure:   false,
            value:    'value1',
        },
    ];

    await t.setCookies({ apiCookie1: 'value1' });

    const cookies = await t.getCookies();

    await t.expect(cookies).eql(expectedCookies);
});

test('Should set cookies by key-values', async t => {
    const expectedCookies = [
        {
            domain:   'localhost',
            expires:  'Infinity',
            httpOnly: false,
            maxAge:   null,
            name:     'apiCookie2',
            path:     '/',
            sameSite: 'none',
            secure:   false,
            value:    'value2',
        },
        {
            domain:   'localhost',
            expires:  'Infinity',
            httpOnly: false,
            maxAge:   null,
            name:     'apiCookie3',
            path:     '/',
            sameSite: 'none',
            secure:   false,
            value:    'value3',
        },
        {
            domain:   'localhost',
            expires:  'Infinity',
            httpOnly: false,
            maxAge:   null,
            name:     'apiCookie4',
            path:     '/',
            sameSite: 'none',
            secure:   false,
            value:    'value4',
        },
    ];

    await t.setCookies([
        { 'apiCookie2': 'value2' }, { 'apiCookie3': 'value3' }, { 'apiCookie4': 'value4' },
    ], 'http://localhost');

    const cookies = await t.getCookies();

    await t.expect(cookies).eql(expectedCookies);
});

fixture`[API] Delete Cookies`
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
    })
    .afterEach(async t => {
        await t.deleteCookies();
    });

test('Should delete all cookies', async t => {
    await t.expect((await t.getCookies()).length).eql(6);
    await t.deleteCookies();
    await t.expect((await t.getCookies()).length).eql(0);
});

test('Should delete cookies by name', async t => {
    await t.expect((await t.getCookies()).length).eql(6);
    await t.deleteCookies('apiCookie1');

    const currentCookies = await t.getCookies();

    await t
        .expect(currentCookies.length).eql(4)
        .expect(currentCookies.some(c => c.name === 'apiCookie1')).notOk();
});

test('Should delete cookies by names', async t => {
    await t.expect((await t.getCookies()).length).eql(6);
    await t.deleteCookies(['apiCookie1', 'apiCookie3']);

    const currentCookies = await t.getCookies();

    await t
        .expect(currentCookies.length).eql(3)
        .expect(currentCookies.some(c => c.name === 'apiCookie1')).notOk()
        .expect(currentCookies.some(c => c.name === 'apiCookie3')).notOk();
});

test('Should delete cookies by name and url', async t => {
    await t.expect((await t.getCookies()).length).eql(6);
    await t.deleteCookies('apiCookie1', 'https://domain1.com/');

    const currentCookies = await t.getCookies();

    await t
        .expect(currentCookies.length).eql(5)
        .expect(currentCookies.some(c => c.name === 'apiCookie1' && c.domain === 'domain1.com')).notOk()
        .expect(currentCookies.some(c => c.name === 'apiCookie1' && c.domain === 'domain2.com')).ok();
});

test('Should delete cookies by names and url', async t => {
    await t.expect((await t.getCookies()).length).eql(6);
    await t.deleteCookies(['apiCookie1', 'apiCookie2'], 'https://domain2.com/');

    const currentCookies = await t.getCookies();

    await t
        .expect(currentCookies.length).eql(4)
        .expect(currentCookies.some(c => c.name === 'apiCookie1' && c.domain === 'domain2.com')).notOk()
        .expect(currentCookies.some(c => c.name === 'apiCookie2' && c.domain === 'domain2.com')).notOk()
        .expect(currentCookies.some(c => c.name === 'apiCookie1' && c.domain === 'domain1.com')).ok();
});

test('Should delete cookies by name and urls', async t => {
    await t.expect((await t.getCookies()).length).eql(6);
    await t.deleteCookies('apiCookie1', ['https://domain1.com/', 'https://domain2.com/']);

    const currentCookies = await t.getCookies();

    await t
        .expect(currentCookies.length).eql(4)
        .expect(currentCookies.some(c => c.name === 'apiCookie1')).notOk();
});

test('Should delete cookies by names and urls', async t => {
    await t.expect((await t.getCookies()).length).eql(6);
    await t.deleteCookies(['apiCookie1', 'apiCookie3'], ['https://domain1.com/', 'https://domain2.com/path-1']);

    const currentCookies = await t.getCookies();

    await t
        .expect(currentCookies.length).eql(4)
        .expect(currentCookies.some(c => c.name === 'apiCookie1' && c.domain === 'domain1.com')).notOk()
        .expect(currentCookies.some(c => c.name === 'apiCookie1' && c.domain === 'domain2.com' && c.path ===
                                         'path-1')).notOk()
        .expect(currentCookies.some(c => c.name === 'apiCookie3' && c.domain === 'domain1.com')).notOk()
        .expect(currentCookies.some(c => c.name === 'apiCookie3' && c.domain === 'domain2.com' && c.path ===
                                         'path-1')).notOk();
});

test('Should delete cookies by object with domain and path', async t => {
    await t.expect((await t.getCookies()).length).eql(6);
    await t.deleteCookies({ domain: 'domain1.com', path: '/path-2' });

    const currentCookies = await t.getCookies();

    await t
        .expect(currentCookies.length).eql(5)
        .expect(currentCookies.some(c => c.domain === 'domain1.com' && c.path === 'path-2')).notOk();
});

test('Should delete cookies by objects', async t => {
    await t.expect((await t.getCookies()).length).eql(6);
    await t.deleteCookies(
        { name: 'apiCookie1' },
        [{ domain: 'domain2.com', path: '/' }],
    );

    const currentCookies = await t.getCookies();

    await t
        .expect(currentCookies.length).eql(3)
        .expect(currentCookies.some(c => c.name === 'apiCookie1')).notOk()
        .expect(currentCookies.some(c => c.name === 'apiCookie2')).notOk();
});

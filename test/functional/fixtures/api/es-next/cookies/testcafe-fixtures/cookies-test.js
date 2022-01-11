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

fixture `Cookies API`;

test('Should set cookies (t.setCookies)', async t => {
    const logger = RequestLogger(/fixtures\/api\/es-next\/cookies\/pages/, { logRequestHeaders: true });

    await t.addRequestHooks(logger);

    const cookiesThatShouldNotBeInRequestHeaders = [
        { name: 'apiCookie13', value: 'value13', domain: 'some-another-domain.com', path: '/' },
        { name: 'apiCookie14', value: 'value14', domain: 'some-another-domain.com', path: '/' },
    ];

    await t
        .setCookies({ apiCookie1: 'value1' }, 'http://localhost')
        .setCookies([
            { 'apiCookie2': 'value2' }, { 'apiCookie3': 'value3' }, { 'apiCookie4': 'value4' },
            { 'apiCookie5': 'value5' }, { 'apiCookie6': 'value6' }, { 'apiCookie7': 'value7' },
            { 'apiCookie8': 'value8' }, { 'apiCookie9': 'value9' }, { 'apiCookie10': 'value10' },
            { 'apiCookie11': 'value11' }, { 'apiCookie12': 'value12' },
        ],
        'http://localhost')
        .setCookies(cookiesThatShouldNotBeInRequestHeaders);

    const cookies = await t.getCookies();

    await t.deleteCookies();

    await t
        .setCookies(cookies[0])
        .setCookies([cookies[1], cookies[2]])
        .setCookies(cookies[3], cookies[4])
        .setCookies(cookies[5], cookies[6], cookies[7])
        .setCookies([cookies[8], cookies[9], cookies[10]], [cookies[11], cookies[12]], cookies[13]);

    await t.navigateTo('http://localhost:3000/fixtures/api/es-next/cookies/pages/index.html');

    await t
        .expect(logger.requests[0].request.headers.cookie)
        .eql('apiCookie1=value1; apiCookie2=value2; apiCookie3=value3; apiCookie4=value4; ' +
            'apiCookie5=value5; apiCookie6=value6; apiCookie7=value7; apiCookie8=value8; ' +
            'apiCookie9=value9; apiCookie10=value10; apiCookie11=value11; apiCookie12=value12');
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

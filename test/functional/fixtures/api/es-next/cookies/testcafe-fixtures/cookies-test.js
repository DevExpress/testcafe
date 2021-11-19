import { RequestLogger } from 'testcafe';

fixture `Cookies API`;

test
    .before(async t => {
        await t
            .setCookies([{ apiCookie1: 'value1' }, { 'apiCookie2': 'value2' }], 'https://domain1.com/')
            .setCookies([
                { name: 'apiCookie3', value: 'value3', domain: 'domain2.com', path: '/' },
                { name: 'apiCookie4', value: 'value4', domain: 'domain2.com', path: '/some-path' },
                { name: 'apiCookie5', value: 'value5', domain: 'domain1.com', path: '/path' },
            ]);
    }).page('http://localhost:3000/fixtures/api/es-next/cookies/pages/index.html')('Should get cookies', async t => {
        const allCookies = await t.getCookies();

        await t
            .expect(allCookies.length).eql(5)
            .expect(allCookies.some(c => c.name === 'apiCookie1' && c.value === 'value1')).ok()
            .expect(allCookies.some(c => c.name === 'apiCookie2' && c.value === 'value2')).ok()
            .expect(allCookies.some(c => c.name === 'apiCookie3' && c.value === 'value3' && c.domain === 'domain2.com' && c.path === '/')).ok()
            .expect(allCookies.some(c => c.name === 'apiCookie4' && c.value === 'value4' && c.domain === 'domain2.com' && c.path === '/some-path')).ok()
            .expect(allCookies.some(c => c.name === 'apiCookie5' && c.value === 'value5' && c.domain === 'domain1.com' && c.path === '/path')).ok();


        const domain1CookiesViaCookieLikeObject = await t.getCookies({ domain: 'domain1.com' });

        await t
            .expect(domain1CookiesViaCookieLikeObject.length).eql(3)
            .expect(domain1CookiesViaCookieLikeObject.some(c => c.name === 'apiCookie1' && c.value === 'value1' && c.path === '/')).ok()
            .expect(domain1CookiesViaCookieLikeObject.some(c => c.name === 'apiCookie2' && c.value === 'value2' && c.path === '/')).ok()
            .expect(domain1CookiesViaCookieLikeObject.some(c => c.name === 'apiCookie5' && c.value === 'value5' && c.path === '/path')).ok();


        const domain2CookiesViaCookieLikeObject = await t.getCookies({ domain: 'domain2.com' });

        await t
            .expect(domain2CookiesViaCookieLikeObject.length).eql(2)
            .expect(domain2CookiesViaCookieLikeObject.some(c => c.name === 'apiCookie3' && c.value === 'value3' && c.domain === 'domain2.com' && c.path === '/')).ok()
            .expect(domain2CookiesViaCookieLikeObject.some(c => c.name === 'apiCookie4' && c.value === 'value4' && c.domain === 'domain2.com' && c.path === '/some-path')).ok();


        const cookiesByNameViaCookieLikeObjects = await t.getCookies({ name: 'apiCookie1' }, [{ name: 'apiCookie2' }, { name: 'apiCookie3' }]);

        await t
            .expect(cookiesByNameViaCookieLikeObjects.length).eql(3)
            .expect(cookiesByNameViaCookieLikeObjects.some(c => c.name === 'apiCookie1' && c.value === 'value1')).ok()
            .expect(cookiesByNameViaCookieLikeObjects.some(c => c.name === 'apiCookie2' && c.value === 'value2')).ok()
            .expect(cookiesByNameViaCookieLikeObjects.some(c => c.name === 'apiCookie3' && c.value === 'value3' && c.domain === 'domain2.com' && c.path === '/')).ok();
    });

test('Should throw an error if an invalid "cookie" argument is specified in t.getCookies(cookie)', async t => {
    await t.getCookies({});
});

test
    .before(async t => {
        await t
            .setCookies([{ apiCookie1: 'value1' }, { 'apiCookie2': 'value2' }], 'https://domain1.com/')
            .setCookies([
                { name: 'apiCookie3', value: 'value3', domain: 'domain2.com', path: '/' },
                { name: 'apiCookie4', value: 'value4', domain: 'domain2.com', path: '/some-path' },
            ]);
    })('Should throw an error if a "cookie" argument contains invalid cookie array elements in t.getCookies(cookie)', async t => {
        const validCookies = await t.getCookies();

        await t.getCookies([validCookies[0], {}, validCookies[1], validCookies[2], validCookies[3]]);
    });

test
    .before(async t => {
        await t
            .setCookies([{ apiCookie1: 'value1' }, { 'apiCookie2': 'value2' }], 'https://domain1.com/')
            .setCookies([
                { name: 'apiCookie3', value: 'value3', domain: 'domain2.com', path: '/' },
                { name: 'apiCookie4', value: 'value4', domain: 'domain2.com', path: '/some-path' },
            ]);
    })('Should throw an error if "...cookies" arguments contain invalid cookie array elements in t.getCookies(...cookies)', async t => {
        const validCookies = await t.getCookies();

        await t.getCookies([validCookies[0], validCookies[1]], validCookies[2], {}, validCookies[3]);
    });

test
    .before(async t => {
        await t
            .setCookies([{ apiCookie1: 'value1' }, { 'apiCookie2': 'value2' }], 'https://domain1.com/')
            .setCookies([
                { name: 'apiCookie3', value: 'value3', domain: 'domain2.com', path: '/' },
                { name: 'apiCookie4', value: 'value4', domain: 'domain2.com', path: '/some-path' },
            ]);
    })('Should throw an error if invalid "...cookies" arguments are specified in t.getCookies(...cookies)', async t => {
        const validCookies = await t.getCookies();

        await t.getCookies(validCookies[0], [validCookies[1]], [validCookies[2], {}, validCookies[3]]);
    });

test('Should throw an error if an invalid "names" argument is specified in t.getCookies(names, urls)', async t => {
    await t.getCookies(1, 'https://valid-url.com');
});

test('Should throw an error if an invalid "names" array argument is specified in t.getCookies(names, urls)', async t => {
    await t.getCookies(['validCookieName', {}], 'https://valid-url.com');
});

test('Should throw an error if an invalid "urls" argument is specified in t.getCookies(names, urls)', async t => {
    await t.getCookies(['validCookieName1', 'validCookieName2'], 1);
});

test('Should throw an error if an invalid "urls" array argument is specified in t.getCookies(names, urls)', async t => {
    await t.getCookies(['validCookieName1', 'validCookieName2'], ['https://valid-url.com', {}]);
});


test('Should set cookies', async t => {
    const logger = RequestLogger(/fixtures\/api\/es-next\/cookies\/pages/, { logRequestHeaders: true });

    await t.addRequestHooks(logger);

    const cookiesThatShouldNotBeInRequestHeaders = [
        { name: 'apiCookie13', value: 'value13', domain: 'some-another-domain.com', path: '/' },
        { name: 'apiCookie14', value: 'value14', domain: 'some-another-domain.com', path: '/' },
    ];

    await t
        .setCookies([
            { apiCookie1: 'value1' }, { 'apiCookie2': 'value2' }, { 'apiCookie3': 'value3' },
            { 'apiCookie4': 'value4' }, { 'apiCookie5': 'value5' }, { 'apiCookie6': 'value6' },
            { 'apiCookie7': 'value7' }, { 'apiCookie8': 'value8' }, { 'apiCookie9': 'value9' },
            { 'apiCookie10': 'value10' }, { 'apiCookie11': 'value11' }, { 'apiCookie12': 'value12' },
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

test('Should throw an error if an invalid "cookie" argument is specified in t.setCookies(cookie)', async t => {
    await t.setCookies({});
});

test
    .before(async t => {
        await t
            .setCookies([{ apiCookie1: 'value1' }, { 'apiCookie2': 'value2' }], 'https://domain1.com/')
            .setCookies([
                { name: 'apiCookie3', value: 'value3', domain: 'domain2.com', path: '/' },
                { name: 'apiCookie4', value: 'value4', domain: 'domain2.com', path: '/some-path' },
            ]);
    })('Should throw an error if a "cookie" argument contains invalid cookie array elements in t.setCookies(cookie)', async t => {
        const validCookies = await t.getCookies();

        await t.setCookies([validCookies[0], {}, validCookies[1], validCookies[2], validCookies[3]]);
    });

test
    .before(async t => {
        await t
            .setCookies([{ apiCookie1: 'value1' }, { 'apiCookie2': 'value2' }], 'https://domain1.com/')
            .setCookies([
                { name: 'apiCookie3', value: 'value3', domain: 'domain2.com', path: '/' },
                { name: 'apiCookie4', value: 'value4', domain: 'domain2.com', path: '/some-path' },
            ]);
    })('Should throw an error if "...cookies" arguments contain invalid cookie array elements in t.setCookies(...cookies)', async t => {
        const validCookies = await t.getCookies();

        await t.setCookies([validCookies[0], validCookies[1]], validCookies[2], {}, validCookies[3]);
    });

test
    .before(async t => {
        await t
            .setCookies([{ apiCookie1: 'value1' }, { 'apiCookie2': 'value2' }], 'https://domain1.com/')
            .setCookies([
                { name: 'apiCookie3', value: 'value3', domain: 'domain2.com', path: '/' },
                { name: 'apiCookie4', value: 'value4', domain: 'domain2.com', path: '/some-path' },
            ]);
    })('Should throw an error if invalid "...cookies" arguments are specified in t.setCookies(...cookies)', async t => {
        const validCookies = await t.getCookies();

        await t.setCookies(validCookies[0], [validCookies[1]], [validCookies[2], {}, validCookies[3]]);
    });

test('Should throw an error if an invalid "nameValueObjects" argument is specified in t.setCookies(nameValueObjects, url)', async t => {
    await t.setCookies({ someCookieName: 'value', unexpectedAdditionalProp: 'value' }, 'https://domain.com');
});

test('Should throw an error if an invalid "nameValueObjects" array argument is specified in t.setCookies(nameValueObjects, url)', async t => {
    await t
        .setCookies([{ 'validCookie': 'value' }, { someCookieName: 'value', unexpectedAdditionalProp: 'value' }], 'https://domain.com');
});

test('Should throw an error if the required "url" argument is not specified in t.setCookies(nameValueObjects, url)', async t => {
    await t
        .setCookies({ 'validCookie': 'value' });
});

test('Should throw an error if no parameters are specified in t.setCookies()', async t => {
    await t.setCookies();
});

test('Should throw an error if an "url" argument has a wrong type in t.setCookies(nameValueObjects, url)', async t => {
    await t.setCookies({ 'validCookie': 'value' }, {});
});

test('Should throw an error if an empty string is set as the "url" argument in t.setCookies(nameValueObjects, url)', async t => {
    await t.setCookies({ 'validCookie': 'value' }, '');
});

test('Should throw an error if a protocol part of the "url" argument cannot be parsed (t.setCookies(nameValueObjects, url))', async t => {
    await t.setCookies({ 'validCookie': 'value' }, '1');
});


test
    .before(async t => {
        await t.setCookies([
            { apiCookie1: 'value1' }, { 'apiCookie2': 'value2' },
            { 'apiCookie3': 'value3' }, { 'apiCookie4': 'value4' },
            { 'apiCookie5': 'value5' }, { 'apiCookie6': 'value6' },
        ],
        'http://localhost');
    })('Should delete cookies', async t => {
        await t
            .expect((await t.getCookies()).length).eql(6)
            .expect((await t.getCookies()).some(c => c.name === 'apiCookie1')).ok();

        await t
            .deleteCookies('apiCookie1', 'http://localhost');


        let currentCookies = await t.getCookies();

        await t
            .expect(currentCookies.length).eql(5)
            .expect(currentCookies.some(c => c.name === 'apiCookie1')).notOk();

        await t
            .deleteCookies('apiCookie2');


        currentCookies = await t.getCookies();

        await t
            .expect(currentCookies.length).eql(4)
            .expect(currentCookies.some(c => c.name === 'apiCookie2')).notOk();

        await t
            .deleteCookies(['apiCookie3', 'apiCookie4']);


        currentCookies = await t.getCookies();

        await t
            .expect(currentCookies.length).eql(2)
            .expect(currentCookies.some(c => c.name === 'apiCookie3')).notOk()
            .expect(currentCookies.some(c => c.name === 'apiCookie4')).notOk();

        await t
            .deleteCookies()
            .expect((await t.getCookies()).length).eql(0);


        const logger = RequestLogger(/fixtures\/api\/es-next\/cookies\/pages/, { logRequestHeaders: true });

        await t
            .addRequestHooks(logger)
            .navigateTo('http://localhost:3000/fixtures/api/es-next/cookies/pages/index.html');

        await t
            .expect(logger.requests[0].request.headers.cookie).notOk();
    });

test('Should throw an error if an invalid "cookie" argument is specified in t.deleteCookies(cookie)', async t => {
    await t.deleteCookies({});
});

test
    .before(async t => {
        await t
            .setCookies([{ apiCookie1: 'value1' }, { 'apiCookie2': 'value2' }], 'https://domain1.com/')
            .setCookies([
                { name: 'apiCookie3', value: 'value3', domain: 'domain2.com', path: '/' },
                { name: 'apiCookie4', value: 'value4', domain: 'domain2.com', path: '/some-path' },
            ]);
    })('Should throw an error if a "cookie" argument contains invalid cookie array elements in t.deleteCookies(cookie)', async t => {
        const validCookies = await t.getCookies();

        await t.deleteCookies([validCookies[0], {}, validCookies[1], validCookies[2], validCookies[3]]);
    });

test
    .before(async t => {
        await t
            .setCookies([{ apiCookie1: 'value1' }, { 'apiCookie2': 'value2' }], 'https://domain1.com/')
            .setCookies([
                { name: 'apiCookie3', value: 'value3', domain: 'domain2.com', path: '/' },
                { name: 'apiCookie4', value: 'value4', domain: 'domain2.com', path: '/some-path' },
            ]);
    })('Should throw an error if "...cookies" arguments contain invalid cookie array elements in t.deleteCookies(...cookies)', async t => {
        const validCookies = await t.getCookies();

        await t.deleteCookies([validCookies[0], validCookies[1]], validCookies[2], {}, validCookies[3]);
    });

test
    .before(async t => {
        await t
            .setCookies([{ apiCookie1: 'value1' }, { 'apiCookie2': 'value2' }], 'https://domain1.com/')
            .setCookies([
                { name: 'apiCookie3', value: 'value3', domain: 'domain2.com', path: '/' },
                { name: 'apiCookie4', value: 'value4', domain: 'domain2.com', path: '/some-path' },
            ]);
    })('Should throw an error if invalid "...cookies" arguments are specified in t.deleteCookies(...cookies)', async t => {
        const validCookies = await t.getCookies();

        await t.deleteCookies(validCookies[0], [validCookies[1]], [validCookies[2], {}, validCookies[3]]);
    });

test('Should throw an error if an invalid "names" argument is specified in t.deleteCookies(names, urls)', async t => {
    await t.deleteCookies(1, 'https://valid-url.com');
});

test('Should throw an error if an invalid "names" array argument is specified in t.deleteCookies(names, urls)', async t => {
    await t.deleteCookies(['validCookieName', {}], 'https://valid-url.com');
});

test('Should throw an error if an invalid "urls" argument is specified in t.deleteCookies(names, urls)', async t => {
    await t.deleteCookies(['validCookieName1', 'validCookieName2'], 1);
});

test('Should throw an error if an invalid "urls" array argument is specified in t.deleteCookies(names, urls)', async t => {
    await t.deleteCookies(['validCookieName1', 'validCookieName2'], ['https://valid-url.com', {}]);
});

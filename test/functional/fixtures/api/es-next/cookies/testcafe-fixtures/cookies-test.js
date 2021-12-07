import { RequestLogger } from 'testcafe';

fixture `Cookies API`;

test
    .before(async t => {
        await t
            .setCookies([{ apiCookie1: 'value1' }, { 'apiCookie2': 'value2' }], 'https://domain1.com/')
            .setCookies([
                { name: 'apiCookie3', value: 'value3', domain: 'domain2.com', path: '/' },
                { name: 'apiCookie4', value: 'value4', domain: 'domain2.com', path: '/path-1' },
                { name: 'apiCookie5', value: 'value5', domain: 'domain1.com', path: '/path-2' },
                { name: 'apiCookie6', value: 'value6', domain: 'domain1.com', path: '/path-2' },
                { name: 'apiCookie3', value: 'value3', domain: 'domain1.com', path: '/' },
                { name: 'apiCookie7', value: 'value7', domain: 'domain2.com', path: '/path-2' },
                { name: 'apiCookie8', value: 'value8', domain: 'domain2.com', path: '/path-2/path-2-1' },
                { name: 'apiCookie9', value: 'value9', domain: 'domain3.com', path: '/path-3' },
                { name: 'apiCookie10', value: 'value10', domain: 'domain3.com', path: '/path-4/path-4-1' },
            ]);
    }).page('http://localhost:3000/fixtures/api/es-next/cookies/pages/index.html')('Should get cookies (t.getCookies)', async t => {
        const allCookies = await t.getCookies();

        await t
            .expect(allCookies.length).eql(11)
            .expect(allCookies.some(c => c.name === 'apiCookie1' && c.value === 'value1')).ok()
            .expect(allCookies.some(c => c.name === 'apiCookie2' && c.value === 'value2')).ok()
            .expect(allCookies.some(c => c.name === 'apiCookie3' && c.value === 'value3' && c.domain === 'domain2.com' && c.path === '/')).ok()
            .expect(allCookies.some(c => c.name === 'apiCookie4' && c.value === 'value4' && c.domain === 'domain2.com' && c.path === '/path-1')).ok()
            .expect(allCookies.some(c => c.name === 'apiCookie5' && c.value === 'value5' && c.domain === 'domain1.com' && c.path === '/path-2')).ok()
            .expect(allCookies.some(c => c.name === 'apiCookie6' && c.value === 'value6' && c.domain === 'domain1.com' && c.path === '/path-2')).ok()
            .expect(allCookies.some(c => c.name === 'apiCookie3' && c.value === 'value3' && c.domain === 'domain1.com' && c.path === '/')).ok()
            .expect(allCookies.some(c => c.name === 'apiCookie7' && c.value === 'value7' && c.domain === 'domain2.com' && c.path === '/path-2')).ok()
            .expect(allCookies.some(c => c.name === 'apiCookie8' && c.value === 'value8' && c.domain === 'domain2.com' && c.path === '/path-2/path-2-1')).ok()
            .expect(allCookies.some(c => c.name === 'apiCookie9' && c.value === 'value9' && c.domain === 'domain3.com' && c.path === '/path-3')).ok()
            .expect(allCookies.some(c => c.name === 'apiCookie10' && c.value === 'value10' && c.domain === 'domain3.com' && c.path === '/path-4/path-4-1')).ok();


        const cookiesByName = await t.getCookies('apiCookie3');

        await t
            .expect(cookiesByName.length).eql(2)
            .expect(cookiesByName.some(c => c.name === 'apiCookie3' && c.value === 'value3' && c.domain === 'domain2.com' && c.path === '/')).ok()
            .expect(cookiesByName.some(c => c.name === 'apiCookie3' && c.value === 'value3' && c.domain === 'domain1.com' && c.path === '/')).ok();


        const cookiesByNames = await t.getCookies(['apiCookie1', 'apiCookie4']);

        await t
            .expect(cookiesByNames.length).eql(2)
            .expect(cookiesByNames.some(c => c.name === 'apiCookie1' && c.value === 'value1')).ok()
            .expect(cookiesByNames.some(c => c.name === 'apiCookie4' && c.value === 'value4' && c.domain === 'domain2.com' && c.path === '/path-1')).ok();


        const cookieByNameAndUrl = await t.getCookies('apiCookie5', 'https://domain1.com/path-2');

        await t
            .expect(cookieByNameAndUrl.length).eql(1)
            .expect(cookieByNameAndUrl.some(c => c.name === 'apiCookie5' && c.value === 'value5' && c.domain === 'domain1.com' && c.path === '/path-2')).ok();


        const cookiesByNamesAndUrl = await t.getCookies(['apiCookie5', 'apiCookie6'], 'https://domain1.com/path-2');

        await t
            .expect(cookiesByNamesAndUrl.length).eql(2)
            .expect(cookiesByNamesAndUrl.some(c => c.name === 'apiCookie5' && c.value === 'value5' && c.domain === 'domain1.com' && c.path === '/path-2')).ok()
            .expect(cookiesByNamesAndUrl.some(c => c.name === 'apiCookie6' && c.value === 'value6' && c.domain === 'domain1.com' && c.path === '/path-2')).ok();


        const cookiesByNameAndUrls = await t.getCookies('apiCookie3', ['https://domain1.com/', 'https://domain2.com/']);

        await t
            .expect(cookiesByNameAndUrls.length).eql(2)
            .expect(cookiesByNameAndUrls.some(c => c.name === 'apiCookie3' && c.value === 'value3' && c.domain === 'domain1.com' && c.path === '/')).ok()
            .expect(cookiesByNameAndUrls.some(c => c.name === 'apiCookie3' && c.value === 'value3' && c.domain === 'domain2.com' && c.path === '/')).ok();


        const domainCookiesByCookieLikeObject = await t.getCookies({ domain: 'domain1.com' });

        await t
            .expect(domainCookiesByCookieLikeObject.length).eql(5)
            .expect(domainCookiesByCookieLikeObject.some(c => c.name === 'apiCookie1' && c.value === 'value1' && c.path === '/')).ok()
            .expect(domainCookiesByCookieLikeObject.some(c => c.name === 'apiCookie2' && c.value === 'value2' && c.path === '/')).ok()
            .expect(domainCookiesByCookieLikeObject.some(c => c.name === 'apiCookie5' && c.value === 'value5' && c.path === '/path-2')).ok()
            .expect(domainCookiesByCookieLikeObject.some(c => c.name === 'apiCookie6' && c.value === 'value6' && c.path === '/path-2')).ok()
            .expect(domainCookiesByCookieLikeObject.some(c => c.name === 'apiCookie3' && c.value === 'value3' && c.domain === 'domain1.com' && c.path === '/')).ok();


        const domainPathCookiesByCookieLikeObject = await t.getCookies({ domain: 'domain2.com', path: '/path-2/path-2-1' });

        await t
            .expect(domainPathCookiesByCookieLikeObject.length).eql(3)
            .expect(domainPathCookiesByCookieLikeObject.some(c => c.name === 'apiCookie3' && c.value === 'value3' && c.domain === 'domain2.com' && c.path === '/')).ok()
            .expect(domainPathCookiesByCookieLikeObject.some(c => c.name === 'apiCookie7' && c.value === 'value7' && c.domain === 'domain2.com' && c.path === '/path-2')).ok()
            .expect(domainPathCookiesByCookieLikeObject.some(c => c.name === 'apiCookie8' && c.value === 'value8' && c.domain === 'domain2.com' && c.path === '/path-2/path-2-1')).ok();


        const cookiesByCookieLikeObjects = await t.getCookies(
            { name: 'apiCookie1' },
            [{ domain: 'domain2.com' }],
            [{ domain: 'domain3.com', path: '/path-3' }],
        );

        await t
            .expect(cookiesByCookieLikeObjects.length).eql(6)
            .expect(cookiesByCookieLikeObjects.some(c => c.name === 'apiCookie1' && c.value === 'value1')).ok()
            .expect(cookiesByCookieLikeObjects.some(c => c.name === 'apiCookie3' && c.value === 'value3' && c.domain === 'domain2.com' && c.path === '/')).ok()
            .expect(cookiesByCookieLikeObjects.some(c => c.name === 'apiCookie4' && c.value === 'value4' && c.domain === 'domain2.com' && c.path === '/path-1')).ok()
            .expect(cookiesByCookieLikeObjects.some(c => c.name === 'apiCookie7' && c.value === 'value7' && c.domain === 'domain2.com' && c.path === '/path-2')).ok()
            .expect(cookiesByCookieLikeObjects.some(c => c.name === 'apiCookie8' && c.value === 'value8' && c.domain === 'domain2.com' && c.path === '/path-2/path-2-1')).ok()
            .expect(cookiesByCookieLikeObjects.some(c => c.name === 'apiCookie9' && c.value === 'value9' && c.domain === 'domain3.com' && c.path === '/path-3')).ok();
    });

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

test
    .before(async t => {
        await t
            .setCookies([
                { apiCookie1: 'value1' }, { apiCookie2: 'value2' },
                { apiCookie3: 'value3' }, { apiCookie4: 'value4' },
                { apiCookie5: 'value5' }, { apiCookie6: 'value6' },
                { apiCookie7: 'value7' }, { apiCookie8: 'value8' },
                { 'apiCookie9': 'value9' }, { 'apiCookie10': 'value10' },
            ],
            'http://localhost')
            .setCookies([
                { apiCookie7: 'value7' }, { apiCookie8: 'value8' },
                { apiCookie9: 'value9' }, { apiCookie10: 'value10' },
            ],
            'https://domain.com');
    })('Should delete cookies (t.deleteCookies)', async t => {
        await t
            .expect((await t.getCookies()).length).eql(14)
            .expect((await t.getCookies()).some(c => c.name === 'apiCookie1' && c.domain === 'localhost')).ok()
            .expect((await t.getCookies()).some(c => c.name === 'apiCookie2' && c.domain === 'localhost')).ok()
            .expect((await t.getCookies()).some(c => c.name === 'apiCookie3' && c.domain === 'localhost')).ok()
            .expect((await t.getCookies()).some(c => c.name === 'apiCookie4' && c.domain === 'localhost')).ok()
            .expect((await t.getCookies()).some(c => c.name === 'apiCookie5' && c.domain === 'localhost')).ok()
            .expect((await t.getCookies()).some(c => c.name === 'apiCookie6' && c.domain === 'localhost')).ok()
            .expect((await t.getCookies()).some(c => c.name === 'apiCookie7' && c.domain === 'localhost')).ok()
            .expect((await t.getCookies()).some(c => c.name === 'apiCookie8' && c.domain === 'localhost')).ok()
            .expect((await t.getCookies()).some(c => c.name === 'apiCookie9' && c.domain === 'localhost')).ok()
            .expect((await t.getCookies()).some(c => c.name === 'apiCookie10' && c.domain === 'localhost')).ok()
            .expect((await t.getCookies()).some(c => c.name === 'apiCookie7' && c.domain === 'domain.com')).ok()
            .expect((await t.getCookies()).some(c => c.name === 'apiCookie8' && c.domain === 'domain.com')).ok()
            .expect((await t.getCookies()).some(c => c.name === 'apiCookie9' && c.domain === 'domain.com')).ok()
            .expect((await t.getCookies()).some(c => c.name === 'apiCookie10' && c.domain === 'domain.com')).ok();


        await t
            .deleteCookies('apiCookie1');

        let currentCookies = await t.getCookies();

        await t
            .expect(currentCookies.length).eql(13)
            .expect(currentCookies.some(c => c.name === 'apiCookie1')).notOk();


        await t
            .deleteCookies('apiCookie2', 'http://localhost');

        currentCookies = await t.getCookies();

        await t
            .expect(currentCookies.length).eql(12)
            .expect(currentCookies.some(c => c.name === 'apiCookie2')).notOk();


        await t
            .deleteCookies(['apiCookie3', 'apiCookie4']);

        currentCookies = await t.getCookies();

        await t
            .expect(currentCookies.length).eql(10)
            .expect(currentCookies.some(c => c.name === 'apiCookie3')).notOk()
            .expect(currentCookies.some(c => c.name === 'apiCookie4')).notOk();


        await t
            .deleteCookies(['apiCookie5', 'apiCookie6'], 'http://localhost');

        currentCookies = await t.getCookies();

        await t
            .expect(currentCookies.length).eql(8)
            .expect(currentCookies.some(c => c.name === 'apiCookie5')).notOk()
            .expect(currentCookies.some(c => c.name === 'apiCookie6')).notOk();


        await t
            .deleteCookies('apiCookie7', ['http://localhost', 'https://domain.com']);

        currentCookies = await t.getCookies();

        await t
            .expect(currentCookies.length).eql(6)
            .expect(currentCookies.some(c => c.name === 'apiCookie7')).notOk();


        await t
            .deleteCookies(['apiCookie8', 'apiCookie9'], ['http://localhost', 'https://domain.com']);

        currentCookies = await t.getCookies();

        await t
            .expect(currentCookies.length).eql(2)
            .expect(currentCookies.some(c => c.name === 'apiCookie8')).notOk()
            .expect(currentCookies.some(c => c.name === 'apiCookie9')).notOk();


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

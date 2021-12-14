const { expect }      = require('chai');
const BaseTestRunMock = require('./helpers/base-test-run-mock');
const Cookies         = require('../../node_modules/testcafe-hammerhead/lib/session/cookies');

describe('Cookies API', () => {
    const mockTestRun = new BaseTestRunMock();

    mockTestRun.session = {};

    const cookiesToPreset = [
        {
            name:     'cookieName1',
            value:    'cookieValue1',
            domain:   'domain1.com',
            path:     '/path1',
            secure:   true,
            httpOnly: true,
        },
        {
            name:     'cookieName2',
            value:    'cookieValue2',
            domain:   'domain1.com',
            path:     '/path2',
            secure:   true,
            httpOnly: true,
            sameSite: 'none',
        },
        {
            name:   'cookieName3',
            value:  'cookieValue3',
            domain: 'domain1.com',
            path:   '/path3',
        },
        {
            name:     'cookieName4',
            value:    'cookieValue4',
            domain:   'domain2.com',
            path:     '/',
            secure:   true,
            httpOnly: true,
        },
        {
            name:     'cookieName5',
            value:    'cookieValue5',
            domain:   'domain2.com',
            path:     '/path5',
            secure:   true,
            httpOnly: true,
        },
        {
            name:     'cookieName6',
            value:    'cookieValue6',
            domain:   'domain3.com',
            path:     '/',
            secure:   true,
            httpOnly: true,
        },
        {
            name:     'cookieName1',
            value:    'cookieValue7',
            domain:   'domain3.com',
            path:     '/',
            secure:   true,
            httpOnly: true,
        },
        {
            name:     'cookieName8',
            value:    'cookieValue8',
            domain:   'domain4.com',
            path:     '/',
            secure:   true,
            httpOnly: true,
        },
        {
            name:     'cookieName9',
            value:    'cookieValue9',
            domain:   'domain4.com',
            path:     '/',
            secure:   true,
            httpOnly: true,
        },
        {
            name:     'cookieName9',
            value:    'cookieValue10',
            domain:   'domain5.com',
            path:     '/',
            secure:   true,
            httpOnly: true,
        },
    ];

    const resultPresetCookiesInStore = cookiesToPreset.map(c => Object.assign({
        expires:  'Infinity',
        maxAge:   null,
        secure:   false,
        httpOnly: false,
        sameSite: 'none',
    }, c));

    function presetCookies () {
        return mockTestRun._setCookies(
            cookiesToPreset,
            void 0,
            void 0,
        );
    }

    function assertCookies (actualCookies, expectedCookies) {
        expect(actualCookies.length).eql(expectedCookies.length);

        for (const expectedCookie of expectedCookies) {
            const foundCookie = actualCookies.find(el => {
                for (const prop in expectedCookie) {
                    if (el[prop] !== expectedCookie[prop])
                        return false;
                }

                return true;
            });

            expect(!!foundCookie).eql(true);
            expect(Object.keys(foundCookie).length).eql(Object.keys(expectedCookie).length);
        }
    }

    it('_prepareCookies', () => {
        mockTestRun.session.cookies = new Cookies();

        const cookiePropertiesThatDoNotChange = {
            value:    void 0,
            expires:  void 0,
            maxAge:   void 0,
            domain:   void 0,
            path:     void 0,
            secure:   void 0,
            httpOnly: void 0,
            sameSite: void 0,
        };

        const toughCookieWithKeyProperty     = Object.assign({ key: 'cookieName' }, cookiePropertiesThatDoNotChange);
        const expectedCookieWithNameProperty = Object.assign({ name: 'cookieName' }, cookiePropertiesThatDoNotChange);

        const actualPreparedCookie = mockTestRun._prepareCookies([toughCookieWithKeyProperty]);

        expect(actualPreparedCookie).eql([expectedCookieWithNameProperty]);
    });

    describe('_setCookies', () => {
        const testCases = [
            {
                cookiesArgumentsParts: {
                    cookies:          [{ name: 'cookieName1', value: 'cookieValue1', domain: 'domain1.com', path: '/' }],
                    nameValueObjects: void 0,
                    url:              void 0,
                },
                nameValueObjectsAndUrlArgumentsParts: {
                    cookies:          void 0,
                    nameValueObjects: [{ cookieName1: 'cookieValue1' }],
                    url:              'https://domain1.com',
                },
                expectedCookies: [
                    {
                        name:     'cookieName1',
                        value:    'cookieValue1',
                        domain:   'domain1.com',
                        path:     '/',
                        maxAge:   null,
                        expires:  'Infinity',
                        secure:   false,
                        httpOnly: false,
                        sameSite: 'none',
                    },
                ],
            },
            {
                cookiesArgumentsParts: {
                    cookies: [
                        { name: 'cookieName2', value: 'cookieValue2', domain: 'domain2.com', path: '/path' },
                        { name: 'cookieName3', value: 'cookieValue3', domain: 'domain2.com', path: '/path' },
                    ],
                    nameValueObjects: void 0,
                    url:              void 0,
                },
                nameValueObjectsAndUrlArgumentsParts: {
                    cookies:          void 0,
                    nameValueObjects: [{ cookieName2: 'cookieValue2' }, { cookieName3: 'cookieValue3' }],
                    url:              'https://domain2.com/path',
                },
                expectedCookies: [
                    {
                        name:     'cookieName2',
                        value:    'cookieValue2',
                        domain:   'domain2.com',
                        path:     '/path',
                        maxAge:   null,
                        expires:  'Infinity',
                        secure:   false,
                        httpOnly: false,
                        sameSite: 'none',
                    },
                    {
                        name:     'cookieName3',
                        value:    'cookieValue3',
                        domain:   'domain2.com',
                        path:     '/path',
                        maxAge:   null,
                        expires:  'Infinity',
                        secure:   false,
                        httpOnly: false,
                        sameSite: 'none',
                    },
                ],
            },
            {
                argumentsParts: {
                    cookies: [
                        { name: 'cookieName4', value: 'cookieValue4', domain: 'domain1.com', path: '/path1' },
                    ],
                    nameValueObjects: void 0,
                    url:              void 0,
                },
                expectedCookies: [
                    {
                        name:     'cookieName4',
                        value:    'cookieValue4',
                        domain:   'domain1.com',
                        path:     '/path1',
                        maxAge:   null,
                        expires:  'Infinity',
                        secure:   false,
                        httpOnly: false,
                        sameSite: 'none',
                    },
                ],
            },
        ];

        it('"cookies" arguments', async () => {
            mockTestRun.session.cookies = new Cookies();

            function testCookies (setCookiesArgumentsParts, expectedCookies) {
                return mockTestRun._setCookies(
                    setCookiesArgumentsParts.cookies,
                    setCookiesArgumentsParts.nameValueObjects,
                    setCookiesArgumentsParts.url
                )
                    .then(() => mockTestRun._enqueueGetCookies({ cookies: void 0, names: void 0, urls: void 0 }))
                    .then(async actualAllCookies => {
                        expect(actualAllCookies.length).eql(expectedCookies.length);
                        expect(actualAllCookies).eql(expectedCookies);

                        return mockTestRun._deleteCookies(void 0, void 0, void 0);
                    });
            }

            for (const testCase of testCases) {
                if (!testCase.cookiesArgumentsParts)
                    continue;

                await testCookies(testCase.cookiesArgumentsParts, testCase.expectedCookies);
            }
        });

        it('"nameValueObjects" and "url" arguments', async () => {
            mockTestRun.session.cookies = new Cookies();

            function testCookies (setCookiesArgumentsParts, expectedCookies) {
                return mockTestRun._setCookies(
                    setCookiesArgumentsParts.cookies,
                    setCookiesArgumentsParts.nameValueObjects,
                    setCookiesArgumentsParts.url
                )
                    .then(() => mockTestRun._enqueueGetCookies({ cookies: void 0, names: void 0, urls: void 0 }))
                    .then(async actualAllCookies => {
                        expect(actualAllCookies.length).eql(expectedCookies.length);
                        expect(actualAllCookies).eql(expectedCookies);

                        return mockTestRun._deleteCookies(void 0, void 0, void 0);
                    });
            }

            for (const testCase of testCases) {
                if (!testCase.nameValueObjectsAndUrlArgumentsParts)
                    continue;

                await testCookies(testCase.nameValueObjectsAndUrlArgumentsParts, testCase.expectedCookies);
            }
        });
    });

    describe('_getCookies', () => {
        const testCases = [
            {
                cookiesArgumentsParts: {
                    cookies: [{ name: 'nonexistentCookieName' }],
                    names:   void 0,
                    urls:    void 0,
                },
                namesUrlsArgumentsParts: {
                    cookies: void 0,
                    names:   ['nonexistentCookieName'],
                    urls:    void 0,
                },
                expectedCookies: [],
            },
            {
                cookiesArgumentsParts: {
                    cookies: [{ name: 'cookieName2' }],
                    names:   void 0,
                    urls:    void 0,
                },
                namesUrlsArgumentsParts: {
                    cookies: void 0,
                    names:   ['cookieName2'],
                    urls:    void 0,
                },
                expectedCookies: [
                    resultPresetCookiesInStore[1],
                ],
            },
            {
                cookiesArgumentsParts: {
                    cookies: [
                        { name: 'cookieName1' },
                        { name: 'cookieName3' },
                    ],
                    names: void 0,
                    urls:  void 0,
                },
                namesUrlsArgumentsParts: {
                    cookies: void 0,
                    names:   ['cookieName1', 'cookieName3'],
                    urls:    void 0,
                },
                expectedCookies: [
                    resultPresetCookiesInStore[0],
                    resultPresetCookiesInStore[2],
                    resultPresetCookiesInStore[6],
                ],
            },
            {
                cookiesArgumentsParts: {
                    cookies: [
                        { name: 'cookieName4', domain: 'domain2.com', path: '/' },
                    ],
                    names: void 0,
                    urls:  void 0,
                },
                namesUrlsArgumentsParts: {
                    cookies: void 0,
                    names:   ['cookieName4'],
                    urls:    ['https://domain2.com'],
                },
                expectedCookies: [
                    resultPresetCookiesInStore[3],
                ],
            },
            {
                cookiesArgumentsParts: {
                    cookies: [
                        { name: 'cookieName8', domain: 'domain4.com', path: '/' },
                        { name: 'cookieName9', domain: 'domain4.com', path: '/' },
                    ],
                    names: void 0,
                    urls:  void 0,
                },
                namesUrlsArgumentsParts: {
                    cookies: void 0,
                    names:   ['cookieName8', 'cookieName9'],
                    urls:    ['https://domain4.com'],
                },
                expectedCookies: [
                    resultPresetCookiesInStore[7],
                    resultPresetCookiesInStore[8],
                ],
            },
            {
                cookiesArgumentsParts: {
                    cookies: [
                        { name: 'cookieName9', domain: 'domain4.com', path: '/' },
                        { name: 'cookieName9', domain: 'domain5.com', path: '/' },
                    ],
                    names: void 0,
                    urls:  void 0,
                },
                namesUrlsArgumentsParts: {
                    cookies: void 0,
                    names:   ['cookieName9'],
                    urls:    ['https://domain4.com', 'https://domain5.com'],
                },
                expectedCookies: [
                    resultPresetCookiesInStore[8],
                    resultPresetCookiesInStore[9],
                ],
            },
            {
                cookiesArgumentsParts: {
                    cookies: [
                        { domain: 'domain1.com' },
                        { domain: 'domain2.com' },
                        { domain: 'domain4.com' },
                        { domain: 'domain5.com' },
                    ],
                    names: void 0,
                    urls:  void 0,
                },
                expectedCookies: [
                    resultPresetCookiesInStore[0],
                    resultPresetCookiesInStore[1],
                    resultPresetCookiesInStore[2],
                    resultPresetCookiesInStore[3],
                    resultPresetCookiesInStore[4],
                    resultPresetCookiesInStore[7],
                    resultPresetCookiesInStore[8],
                    resultPresetCookiesInStore[9],
                ],
            },
            {
                cookiesArgumentsParts: {
                    cookies: [
                        { domain: 'domain1.com', path: '/path1' },
                        { domain: 'domain3.com', path: '/' },
                    ],
                    names: void 0,
                    urls:  void 0,
                },
                expectedCookies: [
                    resultPresetCookiesInStore[0],
                    resultPresetCookiesInStore[5],
                    resultPresetCookiesInStore[6],
                ],
            },
            {
                cookiesArgumentsParts: {
                    cookies: void 0,
                    names:   void 0,
                    urls:    void 0,
                },
                expectedCookies: resultPresetCookiesInStore,
            },
        ];

        it('"cookies" arguments', async () => {
            mockTestRun.session.cookies = new Cookies();

            function testCookies (getCookiesArguments, expectedCookies) {
                return mockTestRun._enqueueGetCookies(getCookiesArguments)
                    .then(async actualCookies => {
                        assertCookies(actualCookies, expectedCookies);
                    });
            }

            await presetCookies();

            for (const testCase of testCases) {
                if (!testCase.cookiesArgumentsParts)
                    continue;

                await testCookies(testCase.cookiesArgumentsParts, testCase.expectedCookies);
            }
        });

        it('"names" and "urls" arguments', async () => {
            mockTestRun.session.cookies = new Cookies();

            function testCookies (getCookiesArguments, expectedCookies) {
                return mockTestRun._enqueueGetCookies(getCookiesArguments)
                    .then(async actualCookies => {
                        assertCookies(actualCookies, expectedCookies);
                    });
            }

            await presetCookies();

            for (const testCase of testCases) {
                if (!testCase.namesUrlsArgumentsParts)
                    continue;

                await testCookies(testCase.namesUrlsArgumentsParts, testCase.expectedCookies);
            }
        });
    });

    describe('_deleteCookies', () => {
        const deleteCookiesTestCases = [
            {
                cookiesArgumentsParts: {
                    cookies: [{ name: 'nonexistentCookieName' }],
                    names:   void 0,
                    urls:    void 0,
                },
                namesUrlsArgumentsParts: {
                    cookies: void 0,
                    names:   ['nonexistentCookieName'],
                    urls:    void 0,
                },
                expectedCookies: resultPresetCookiesInStore,
            },
            {
                cookiesArgumentsParts: {
                    cookies: [{ name: 'cookieName2' }],
                    names:   void 0,
                    urls:    void 0,
                },
                namesUrlsArgumentsParts: {
                    cookies: void 0,
                    names:   ['cookieName2'],
                    urls:    void 0,
                },
                expectedCookies: [
                    resultPresetCookiesInStore[0],
                    resultPresetCookiesInStore[2],
                    resultPresetCookiesInStore[3],
                    resultPresetCookiesInStore[4],
                    resultPresetCookiesInStore[5],
                    resultPresetCookiesInStore[6],
                    resultPresetCookiesInStore[7],
                    resultPresetCookiesInStore[8],
                    resultPresetCookiesInStore[9],
                ],
            },
            {
                cookiesArgumentsParts: {
                    cookies: [
                        { name: 'cookieName1' },
                        { name: 'cookieName3' },
                    ],
                    names: void 0,
                    urls:  void 0,
                },
                namesUrlsArgumentsParts: {
                    cookies: void 0,
                    names:   ['cookieName1', 'cookieName3'],
                    urls:    void 0,
                },
                expectedCookies: [
                    resultPresetCookiesInStore[1],
                    resultPresetCookiesInStore[3],
                    resultPresetCookiesInStore[4],
                    resultPresetCookiesInStore[5],
                    resultPresetCookiesInStore[7],
                    resultPresetCookiesInStore[8],
                    resultPresetCookiesInStore[9],
                ],
            },
            {
                cookiesArgumentsParts: {
                    cookies: [
                        { name: 'cookieName4', domain: 'domain2.com', path: '/' },
                    ],
                    names: void 0,
                    urls:  void 0,
                },
                namesUrlsArgumentsParts: {
                    cookies: void 0,
                    names:   ['cookieName4'],
                    urls:    ['https://domain2.com'],
                },
                expectedCookies: [
                    resultPresetCookiesInStore[0],
                    resultPresetCookiesInStore[1],
                    resultPresetCookiesInStore[2],
                    resultPresetCookiesInStore[4],
                    resultPresetCookiesInStore[5],
                    resultPresetCookiesInStore[6],
                    resultPresetCookiesInStore[7],
                    resultPresetCookiesInStore[8],
                    resultPresetCookiesInStore[9],
                ],
            },
            {
                cookiesArgumentsParts: {
                    cookies: [
                        { name: 'cookieName8', domain: 'domain4.com', path: '/' },
                        { name: 'cookieName9', domain: 'domain4.com', path: '/' },
                    ],
                    names: void 0,
                    urls:  void 0,
                },
                namesUrlsArgumentsParts: {
                    cookies: void 0,
                    names:   ['cookieName8', 'cookieName9'],
                    urls:    ['https://domain4.com'],
                },
                expectedCookies: [
                    resultPresetCookiesInStore[0],
                    resultPresetCookiesInStore[1],
                    resultPresetCookiesInStore[2],
                    resultPresetCookiesInStore[3],
                    resultPresetCookiesInStore[4],
                    resultPresetCookiesInStore[5],
                    resultPresetCookiesInStore[6],
                    resultPresetCookiesInStore[9],
                ],
            },
            {
                cookiesArgumentsParts: {
                    cookies: [
                        { name: 'cookieName9', domain: 'domain4.com', path: '/' },
                        { name: 'cookieName9', domain: 'domain5.com', path: '/' },
                    ],
                    names: void 0,
                    urls:  void 0,
                },
                namesUrlsArgumentsParts: {
                    cookies: void 0,
                    names:   ['cookieName9'],
                    urls:    ['https://domain4.com', 'https://domain5.com'],
                },
                expectedCookies: [
                    resultPresetCookiesInStore[0],
                    resultPresetCookiesInStore[1],
                    resultPresetCookiesInStore[2],
                    resultPresetCookiesInStore[3],
                    resultPresetCookiesInStore[4],
                    resultPresetCookiesInStore[5],
                    resultPresetCookiesInStore[6],
                    resultPresetCookiesInStore[7],
                ],
            },
            {
                cookiesArgumentsParts: {
                    cookies: [
                        { domain: 'domain1.com' },
                        { domain: 'domain2.com' },
                        { domain: 'domain4.com' },
                        { domain: 'domain5.com' },
                    ],
                    names: void 0,
                    urls:  void 0,
                },
                expectedCookies: [
                    resultPresetCookiesInStore[5],
                    resultPresetCookiesInStore[6],
                ],
            },
            {
                cookiesArgumentsParts: {
                    cookies: [
                        { domain: 'domain1.com', path: '/path1' },
                        { domain: 'domain3.com', path: '/' },
                    ],
                    names: void 0,
                    urls:  void 0,
                },
                expectedCookies: [
                    resultPresetCookiesInStore[1],
                    resultPresetCookiesInStore[2],
                    resultPresetCookiesInStore[3],
                    resultPresetCookiesInStore[4],
                    resultPresetCookiesInStore[7],
                    resultPresetCookiesInStore[8],
                    resultPresetCookiesInStore[9],
                ],
            },
            {
                cookiesArgumentsParts: {
                    cookies: void 0,
                    names:   void 0,
                    urls:    void 0,
                },
                expectedCookies: [],
            },
        ];

        it('"cookies" arguments', async () => {
            mockTestRun.session.cookies = new Cookies();

            function testCookies (deleteCookiesArgumentsParts, expectedCookies) {
                return presetCookies()
                    .then(() => mockTestRun._deleteCookies(deleteCookiesArgumentsParts.cookies, deleteCookiesArgumentsParts.names, deleteCookiesArgumentsParts.urls))
                    .then(() => mockTestRun._enqueueGetCookies({ cookies: void 0, names: void 0, urls: void 0 }))
                    .then(async actualAllCookies => {
                        expect(actualAllCookies).eql(expectedCookies);

                        return mockTestRun._deleteCookies(void 0, void 0, void 0);
                    });
            }

            await presetCookies();

            for (const testCase of deleteCookiesTestCases) {
                if (!testCase.cookiesArgumentsParts)
                    continue;

                await testCookies(testCase.cookiesArgumentsParts, testCase.expectedCookies);
            }
        });

        it('"names" and "urls" arguments', async () => {
            mockTestRun.session.cookies = new Cookies();

            function testCookies (deleteCookiesArgumentsParts, expectedCookies) {
                return presetCookies()
                    .then(() => mockTestRun._deleteCookies(deleteCookiesArgumentsParts.cookies, deleteCookiesArgumentsParts.names, deleteCookiesArgumentsParts.urls))
                    .then(() => mockTestRun._enqueueGetCookies({ cookies: void 0, names: void 0, urls: void 0 }))
                    .then(async actualAllCookies => {
                        expect(actualAllCookies).eql(expectedCookies);

                        return mockTestRun._deleteCookies(void 0, void 0, void 0);
                    });
            }

            await presetCookies();

            for (const testCase of deleteCookiesTestCases) {
                if (!testCase.namesUrlsArgumentsParts)
                    continue;

                await testCookies(testCase.namesUrlsArgumentsParts, testCase.expectedCookies);
            }
        });
    });
});

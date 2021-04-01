const { RequestFilterRule }                       = require('testcafe-hammerhead');
const testRunTracker                              = require('../../lib/api/test-run-tracker');
const exportableLib                               = require('../../lib/api/exportable-lib');
const { RequestMock, RequestLogger, RequestHook } = exportableLib;
const nanoid                                      = require('nanoid');
const { expect }                                  = require('chai');

describe('RequestLogger', () => {
    const createProxyRequestEventMock = (testRunId, requestId) => {
        return {
            isAjax:       false,
            _requestInfo: {
                requestId: requestId,
                userAgent: 'Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36',
                url:       'http://example.com/',
                method:    'get',
                headers:   {
                    'accept':          'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
                    'accept-encoding': 'gzip, deflate',
                    'accept-language': 'en-US,en;q=0.9',
                    'cache-control':   'max-age=0'
                },
                body:      Buffer.from('testParamerValue'),
                sessionId: testRunId
            }
        };
    };

    const createProxyResponseEventMock = (testRunId, requestId) => {
        return {
            requestId:  requestId,
            body:       Buffer.from('<html><body><h1>Content</h1></body></html>'),
            statusCode: 304,
            sessionId:  testRunId,
            headers:    {
                'cache-control': 'max-age=604800',
                'date':          'Wed, 17 Jan 2018 10:08:08 GMT',
                'etag':          '359670651'
            }
        };
    };

    const requestId         = nanoid(9);
    const testRunId         = nanoid(9);
    const requestEventMock  = createProxyRequestEventMock(requestId, testRunId);
    const responseEventMock = createProxyResponseEventMock(requestId, testRunId);

    describe('Check collected data', () => {
        const getLoggerRequests = logOptions => {
            const logger = new RequestLogger('http://example.com', logOptions);

            logger.onRequest(requestEventMock);
            logger.onResponse(responseEventMock);

            return logger.requests;
        };

        it('Default', () => {
            const requests = getLoggerRequests();

            expect(requests.length).eql(1);
            expect(requests[0].request.timestamp).to.be.a('number');
            expect(requests[0].request.headers).to.be.undefined;
            expect(requests[0].request.body).to.be.undefined;
            expect(requests[0].response.timestamp).to.be.a('number');
            expect(requests[0].response.headers).to.be.undefined;
            expect(requests[0].response.body).to.be.undefined;
        });

        it('Headers and body', () => {
            const requests = getLoggerRequests({
                logRequestHeaders:  true,
                logRequestBody:     true,
                logResponseHeaders: true,
                logResponseBody:    true
            });

            expect(requests.length).eql(1);
            expect(requests[0].request.headers).eql(requestEventMock._requestInfo.headers);
            expect(requests[0].request.body).eql(requestEventMock._requestInfo.body);
            expect(requests[0].request.body).instanceOf(Buffer);
            expect(requests[0].response.headers).eql(responseEventMock.headers);
            expect(requests[0].response.body).eql(responseEventMock.body);
            expect(requests[0].response.body).instanceof(Buffer);
        });

        it('Stringify body', () => {
            const requests = getLoggerRequests({
                logRequestBody:        true,
                stringifyRequestBody:  true,
                logResponseBody:       true,
                stringifyResponseBody: true
            });

            expect(requests.length).eql(1);
            expect(requests[0].request.body).eql(requestEventMock._requestInfo.body.toString());
            expect(requests[0].response.body).eql(responseEventMock.body.toString());
        });
    });

    it('.clear method', () => {
        const logger = new RequestLogger('http://example.com');

        const requestId1         = nanoid(9);
        const requestId2         = nanoid(9);
        const testRunId1         = nanoid(9);
        const testRunId2         = nanoid(9);
        const requestEventMock1  = createProxyRequestEventMock(testRunId1, requestId1);
        const responseEventMock1 = createProxyResponseEventMock(testRunId1, requestId1);
        const requestEventMock2  = createProxyRequestEventMock(testRunId2, requestId2);
        const responseEventMock2 = createProxyResponseEventMock(testRunId2, requestId2);

        logger.onRequest(requestEventMock1);
        logger.onResponse(responseEventMock1);
        logger.onRequest(requestEventMock2);
        logger.onResponse(responseEventMock2);

        const storedResolveContextTestRunFn = testRunTracker.resolveContextTestRun;

        testRunTracker.resolveContextTestRun = () => {
            return {
                id: testRunId1
            };
        };

        // With test context
        logger.clear();
        expect(logger.requests.length).eql(0);

        const internalRequestIds   = Object.keys(logger._internalRequests);
        const firstInternalRequest = logger._internalRequests[internalRequestIds[0]];

        expect(internalRequestIds.length).eql(1);
        expect(firstInternalRequest.testRunId).eql(testRunId2);
        expect(firstInternalRequest.id).eql(requestId2);

        testRunTracker.resolveContextTestRun = () => void 0;

        // Without test context
        logger.clear();
        expect(logger.requests.length).eql(0);

        testRunTracker.resolveContextTestRun = storedResolveContextTestRunFn;
    });

    it('.requests property without test context', () => {
        const logger = new RequestLogger();

        expect(logger.requests.length).eql(0);

        logger.onRequest(requestEventMock);
        logger.onResponse(responseEventMock);

        expect(logger.requests.length).eql(1);
    });

    it('.contains and .count methods should affect only completed requests', () => {
        const logger            = new RequestLogger();
        const requestEventMock2 = createProxyRequestEventMock(nanoid(9), nanoid(9));

        logger.onRequest(requestEventMock);
        logger.onResponse(responseEventMock);
        logger.onRequest(requestEventMock2);

        return Promise.all([
            logger.count(r => r.request),
            logger.count(r => r.response.statusCode === 304),
            logger.contains(r => r.request.id === requestEventMock2._requestInfo.requestId)
        ])
            .then(data => {
                expect(data[0]).eql(1);
                expect(data[1]).eql(1);
                expect(data[2]).eql(false);
            });
    });

    it('Should not raise an error if during a long running request the ".clear" method will be called (GH-2688)', () => {
        const logger = new RequestLogger();

        logger.onRequest(requestEventMock);
        logger.clear();
        logger.onResponse(responseEventMock);

        expect(logger.requests.length).eql(0);
    });

    it('Should not fail when logger logs and stringifies a response body and it equals null (GH-2718)', () => {
        const logger                  = new RequestLogger('http://example.com/', { logResponseBody: true, stringifyResponseBody: true });
        const clonedResponseEventMock = Object.assign({}, responseEventMock, { body: null });

        logger.onRequest(requestEventMock);
        logger.onResponse(clonedResponseEventMock);

        expect(logger.requests[0].response.body).eql(null);
    });
});

describe('RequestMock', () => {
    describe('Throwing errors on construction', () => {
        it('Without configure', () => {
            expect(() => {
                RequestMock();
            }).to.not.throw;
        });
        it('With configure', () => {
            expect(() => {
                RequestMock()
                    .onRequestTo('http://example.com')
                    .respond('<html></html>');
            }).to.not.throw;
        });
    });

    it('Should handle only specified requests (GH-2336)', () => {
        const mock = RequestMock()
            .onRequestTo('http://example.com')
            .respond();

        expect(mock._requestFilterRules.length).eql(1);
        expect(mock._requestFilterRules[0].options.url).eql('http://example.com');
    });
});

describe('RequestHook', () => {
    it('Should handle any requests by default', () => {
        const hook = new RequestHook();

        expect(hook._requestFilterRules.length).eql(1);
        expect(hook._requestFilterRules[0].options).eql(RequestFilterRule.ANY.options);
    });

    it('Should have an identifier', () => {
        const hook = new RequestHook();

        expect(hook.id).not.undefined;
    });
});


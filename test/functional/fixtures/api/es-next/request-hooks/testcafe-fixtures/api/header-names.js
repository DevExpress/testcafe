import {
    RequestMock,
    RequestLogger,
    ClientFunction,
    RequestHook,
} from 'testcafe';

import ReExecutablePromise from '../../../../../../../../lib/utils/re-executable-promise.js';

const SERVICE_URL = 'https://external-service.com/api/';

const filterRequestPredicate = req => {
    return req.url === SERVICE_URL
        && req.headers['x-custom-request-header'] === 'value1';
};

const logger = RequestLogger(filterRequestPredicate, {
    logRequestHeaders:  true,
    logResponseHeaders: true,
});

const mock = RequestMock()
    .onRequestTo(SERVICE_URL)
    .respond((req, res) => {
        res.headers['access-control-allow-origin']  = '*';
        res.headers['access-control-allow-headers'] = '*';
        res.headers['X-custom-response-HEADER']     = 'value2';

        res.setBody(JSON.stringify({ data: 1 }));
    });

class CustomRequestHook extends RequestHook {
    constructor () {
        super(filterRequestPredicate);

        this.onResponseCallCountInternal = 0;
        this.requestHeaders             = null;
        this.responseHeaders            = null;
    }

    async onRequest (e) {
        this.requestHeaders = e.requestOptions.headers;
    }
    async onResponse (e) {
        this.responseHeaders = e.headers;

        this.onResponseCallCountInternal++;
    }

    get onResponseCallCount () {
        return ReExecutablePromise.fromFn(async () => this.onResponseCallCountInternal);
    }
}

const customRequestHook = new CustomRequestHook();

fixture `Fixture`
    .requestHooks(mock, logger, customRequestHook);

test('header names should be lowercased', async t => {
    const result = await ClientFunction(() => {
        return fetch(SERVICE_URL, {
            method:  'POST',
            headers: { 'X-Custom-Request-Header': 'value1' },
        }).then(res => res.json());
    }, { dependencies: { SERVICE_URL } })();

    await t
        .expect(result).eql({ data: 1 })
        .expect(logger.contains(req => req.request.url === SERVICE_URL)).ok()
        .expect(customRequestHook.onResponseCallCount).eql(1);

    const req1 = logger.requests[0];

    await t
        .expect(req1.request.headers['x-custom-request-header']).eql('value1')
        .expect(req1.response.headers['x-custom-response-header']).eql('value2')
        .expect(customRequestHook.requestHeaders['x-custom-request-header']).eql('value1');
});

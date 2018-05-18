/// <reference path="../../../../../ts-defs/index.d.ts" />
import {ClientFunction, RequestLogger, RequestMock, RequestHook} from 'testcafe';

class CustomRequestHook extends RequestHook {
    constructor() {
        super();
    }

    onRequest(event) {

    }

    onResponse(event) {

    }
}

const customHook = new CustomRequestHook();
const logger     = RequestLogger('example.com', {logRequestBody: true});

const mock = RequestMock()
    .onRequestTo(/example.com/)
    .respond()
    .onRequestTo({url: 'https://example.com'})
    .respond(null, 204)
    .onRequestTo('https://example.com')
    .respond(null, 200, {'x-frame-options': 'deny'});

fixture `Request Hooks`
    .requestHooks(mock, logger, customHook);

test
    .requestHooks(logger)
    ('Request hook', async t => {
        await t
            .addRequestHooks(mock)
            .removeRequestHooks(mock)
            .expect(logger.contains(t => t.request.statusCode === 200)).ok()
            .expect(logger.count(t => t.request.statusCode === 200)).eql(1)
            .expect(logger.requests[0].request.body === 'test').ok();
    });

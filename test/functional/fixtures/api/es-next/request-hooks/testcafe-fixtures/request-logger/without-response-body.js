import { RequestLogger } from 'testcafe';

const LOGGER_OPTIONS = {
    logRequestHeaders:  true,
    logRequestBody:     true,
    logResponseHeaders: true,
    logResponseBody:    true,
};

const loggedOptionsRequestUrl = 'http://localhost:3000/options';
const optionRequestLogger     = RequestLogger(loggedOptionsRequestUrl, LOGGER_OPTIONS);

const logged204RequestUrl = 'http://localhost:3000/204';
const _204RequestLogger   = RequestLogger(logged204RequestUrl, LOGGER_OPTIONS);

fixture `Fixture`
    .page('http://localhost:3000/fixtures/api/es-next/request-hooks/pages/request-logger/without-response-body.html')
    .requestHooks(optionRequestLogger, _204RequestLogger);

test('test', async t => {
    await t
        .click('#send-options-request')
        .expect(optionRequestLogger.count(r => r.request.url === loggedOptionsRequestUrl)).eql(1);

    await t.expect(optionRequestLogger.requests[0].response.body).eql(Buffer.alloc(0));

    await t
        .click('#send-204-request')
        .expect(_204RequestLogger.count(r => r.request.url === logged204RequestUrl)).eql(1);

    await t.expect(_204RequestLogger.requests[0].response.body).eql(Buffer.alloc(0));
});

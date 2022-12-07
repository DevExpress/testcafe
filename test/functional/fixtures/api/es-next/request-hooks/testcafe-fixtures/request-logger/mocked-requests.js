import { RequestMock, RequestLogger } from 'testcafe';
import MOCK_ROUTES from '../../common/mock-routes.js';

const logger = RequestLogger(MOCK_ROUTES.post, {
    logRequestHeaders:     true,
    logResponseHeaders:    true,
    logResponseBody:       true,
    stringifyResponseBody: true,
});

const mock = RequestMock()
    .onRequestTo(MOCK_ROUTES.post)
    .respond((req, res) => {
        res.headers['access-control-allow-origin']  = '*';

        if (req.method === 'OPTIONS')
            res.headers['access-control-allow-headers'] = 'x-custom-header';
        else {
            res.headers['x-custom-header'] = 'mocked';

            res.setBody(JSON.stringify({ foo: 'mocked' }));
        }
    });

fixture `Fixture`
    .requestHooks(logger, mock)
    .page `http://localhost:3000/fixtures/api/es-next/request-hooks/pages/request-logger/mocked-requests.html`;

test('Log mocked requests', async t => {
    await t
        .click('#send-request')
        .expect(logger.count(r => r.request.url === MOCK_ROUTES.post)).eql(2);

    const req = logger.requests[1];

    await t
        .expect(req.request.headers['x-custom-header']).eql('test')
        .expect(req.response.headers['x-custom-header']).eql('mocked')
        .expect(req.response.body).eql('{"foo":"mocked"}');
});

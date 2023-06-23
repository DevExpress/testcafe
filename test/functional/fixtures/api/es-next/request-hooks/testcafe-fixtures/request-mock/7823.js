import { RequestMock } from 'testcafe';
import { noop } from 'lodash';

const mock = RequestMock()
    .onRequestTo(/script.js/)
    .respond('scriptMocked=true;', 200, {
        'content-type': 'application/javascript',
    });

fixture `Fixture`
    .page('http://localhost:3000/fixtures/api/es-next/request-hooks/pages/request-mock/7823/index.html')
    .requestHooks(mock);

test('Test', noop);

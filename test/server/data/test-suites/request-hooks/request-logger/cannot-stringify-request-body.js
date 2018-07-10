import { RequestLogger } from 'testcafe';

fixture `Fixture`;

const logger = new RequestLogger('', {
    logRequestBody:       false,
    stringifyRequestBody: true
});

test('test', async () => {});

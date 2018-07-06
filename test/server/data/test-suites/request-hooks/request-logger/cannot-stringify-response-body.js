import { RequestLogger } from 'testcafe';

fixture `Fixture`;

const logger = new RequestLogger('', {
    logResponseBody:       false,
    stringifyResponseBody: true
});

test('test', async () => {});

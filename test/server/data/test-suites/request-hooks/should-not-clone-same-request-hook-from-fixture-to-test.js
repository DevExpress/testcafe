import { RequestLogger } from 'testcafe';

const logger1 = RequestLogger('https://example.com');
const logger2 = RequestLogger('https://example.com');
const logger3 = RequestLogger('https://exmaple.com');

fixture `Fixture`
    .requestHooks([logger1, logger2]);

test.
    requestHooks(logger1, logger2, logger3)
    ('test', async t => {});

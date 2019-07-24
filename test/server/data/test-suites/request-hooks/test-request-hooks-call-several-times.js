import { RequestLogger } from 'testcafe';

const logger1 = new RequestLogger();
const logger2 = new RequestLogger();

fixture `Fixture`;

test
    .requestHooks(logger1)
    .requestHooks(logger2)
    ('test', async t => {});

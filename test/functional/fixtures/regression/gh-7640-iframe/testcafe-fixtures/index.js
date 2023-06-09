import { RequestLogger } from 'testcafe';

fixture `Should handle requests in specific iframe in Native Automation mode`
    .page `http://localhost:3000/fixtures/regression/gh-7640-iframe/pages/dynamic-oopif.html`;

const logger = new RequestLogger();

test.requestHooks(logger)(`Should handle requests in specific iframe in Native Automation mode`, async t => {
    await t.switchToIframe('iframe');

    await t.expect(logger.contains(r => r.request.url.includes('?test'))).ok();
});

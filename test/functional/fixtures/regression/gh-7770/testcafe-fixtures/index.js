import { Selector, RequestLogger } from 'testcafe';

const logger = new RequestLogger();

fixture `Should handle iframe + worker in Native Automation mode`
    .page `http://localhost:3000/fixtures/regression/gh-7770/pages/index.html`
    .requestHooks(logger);

test('Should handle iframe + worker in Native Automation mode', async t => {
    await t.switchToIframe('iframe');

    await t.expect(Selector('h1').innerText).eql('Header is set from worker');

    await t.expect(logger.contains(r => r.request.url === 'http://localhost:3000/?fromIFrame')).ok();
    await t.expect(logger.contains(r => r.request.url === 'http://localhost:3000/?fromWorker')).ok();
});

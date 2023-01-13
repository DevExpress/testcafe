import { Role } from 'testcafe';
import testInfo from '../test-info.js';

const DEMO_ROLE = Role('http://localhost:3000/fixtures/concurrency/pages/index.html', async () => {
});

fixture`F1`
    .beforeEach(async t => {
        await t.useRole(DEMO_ROLE);
    })
    .after(() => {
        testInfo.save();
        testInfo.clear();
    });

test('T1', async (t) => {
    testInfo.add(await t.eval(() => window.location.pathname));
}).page('http://localhost:3000/fixtures/concurrency/pages/first-page.html');

test('T2', async (t) => {
    testInfo.add(await t.eval(() => window.location.pathname));
}).page('http://localhost:3000/fixtures/concurrency/pages/second-page.html');

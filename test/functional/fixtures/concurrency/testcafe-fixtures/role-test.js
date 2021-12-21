import { Role } from 'testcafe';
import timeline from '../timeline';

const DEMO_ROLE = Role('http://localhost:3000/fixtures/concurrency/pages/index.html', async () => {
});

fixture`F1`
    .beforeEach(async t => {
        await t.useRole(DEMO_ROLE);
    })
    .after(() => {
        timeline.save();
        timeline.clear();
    });

test('T1', async (t) => {
    timeline.add(await t.eval(() => window.location.pathname));
}).page('http://localhost:3000/fixtures/concurrency/pages/first-page.html');

test('T2', async (t) => {
    timeline.add(await t.eval(() => window.location.pathname));
}).page('http://localhost:3000/fixtures/concurrency/pages/second-page.html');

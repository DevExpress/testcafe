import { Role } from 'testcafe';
import timeline from '../timeline';

const DEMO_ROLE = Role('http://localhost:3000/fixtures/concurrency/pages/index.html', async () => {
});

fixture`F1`
    .page('http://localhost:3000/fixtures/concurrency/pages/first-page.html')
    .beforeEach(async t => {
        await t.useRole(DEMO_ROLE);
    })
    .after(() => {
        timeline.save();
        timeline.clear();
    });

test('T1', async t => {
    const location = await t.eval(() => window.location.pathname);

    timeline.add(location);
});

fixture`F2`
    .page('http://localhost:3000/fixtures/concurrency/pages/second-page.html')
    .beforeEach(async t => {
        await t.useRole(DEMO_ROLE);
    });

test('T2', async t => {
    const location = await t.eval(() => window.location.pathname);

    timeline.add(location);
});

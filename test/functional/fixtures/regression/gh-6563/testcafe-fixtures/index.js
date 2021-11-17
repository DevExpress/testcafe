import { ClientFunction } from 'testcafe';

const reload = ClientFunction(() => window.location.reload());

fixture `Should pass correct "this" argument on the "beforeunload" event`
    .page `http://localhost:3000/fixtures/regression/gh-6563/pages/index.html`;

test(`Should pass correct "this" argument on the "beforeunload" event`, async () => {
    await reload();
});

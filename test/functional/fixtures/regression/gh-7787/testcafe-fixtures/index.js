import { RequestMock } from 'testcafe';

let logged = false;

const mock = RequestMock()
    .onRequestTo(/custom/)
    .respond((req, res) => {
        res.statusCode = '200';
        logged = true;
    });

fixture `Should not fail if \`statusCode\` is set as string`
    .page`http://localhost:3000/fixtures/regression/gh-7787/pages/index.html`
    .requestHooks(mock);

test('Should not fail if `statusCode` is set as string', async t => {
    await t.expect(logged).ok();
});

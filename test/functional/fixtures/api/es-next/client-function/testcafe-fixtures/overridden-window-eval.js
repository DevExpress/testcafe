import { ClientFunction } from 'testcafe';

fixture `fixture`
    .page('http://localhost:3000/fixtures/api/es-next/client-function/pages/overridden-window-eval.html');

const getDocumentTitle = ClientFunction(() => document.title);

test(`test`, async t => {
    await t.expect(getDocumentTitle()).eql('GH-4693');
});

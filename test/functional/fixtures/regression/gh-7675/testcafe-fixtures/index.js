import { Selector } from 'testcafe';

fixture `Requests from worker should not fail in native automation`;

test.page('http://localhost:3000/fixtures/regression/gh-7675/pages/import.html')
('`importScripts` in worker should not fail in native automation', async () => {
});

test.page('http://localhost:3000/fixtures/regression/gh-7675/pages/xhr.html')
('The `XHR` request in worker should not fail in native automation', async t => {
    await t.expect(Selector('h1').innerText).eql('// do nothing');
});


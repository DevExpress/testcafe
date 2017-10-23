import fs from 'fs';
import { Selector } from 'testcafe';

fixture `GH-1907`
    .page `http://localhost:3000/fixtures/regression/gh-1907/pages/index.html`;

test('Check boundTestRun', async t => {
    const div = Selector('#div', { boundTestRun: t });

    return new Promise((resolve, reject) => {
        fs.readFile('not/exists', async () => {
            try {
                await t
                    .expect(div.nth(0).exists).ok()
                    .expect(div.withText('div').exists).ok()
                    .expect(div.withAttribute('id', 'div').exists).ok()
                    .expect(div.filter(() => true).exists).ok()
                    .expect(div.find('#child').exists).ok()
                    .expect(div.parent().exists).ok()
                    .expect(div.child().exists).ok()
                    .expect(div.sibling().exists).ok()
                    .expect(div.nextSibling().exists).ok()
                    .expect(div.prevSibling().exists).ok();
            }
            catch (err) {
                reject(err);
                return;
            }

            resolve();
        });
    });
});

test('Check timeout and visibilityCheck', async t => {
    await t.click(Selector('#delay', { timeout: 2000 }).withText('Appears after delay'));

    const div = Selector('#hidden', { visibilityCheck: true }).withText('Hidden');

    await t.expect(div.textContent).eql('Hidden');
});

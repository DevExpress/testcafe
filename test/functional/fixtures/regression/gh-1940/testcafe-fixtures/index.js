import { ClientFunction } from 'testcafe';
import { saveWindowState, restoreWindowState } from '../../../../window-helpers';


const removeBodyMargin = ClientFunction(() => {
    document.body.style.margin = 0;
});

fixture `GH-1940 - Should scroll to element when body has scroll`
    .beforeEach(async t => {
        await saveWindowState(t);

        await t.resizeWindow(700, 400);
    })
    .afterEach(async t => {
        await restoreWindowState(t);
    });

const testCases = [
    {
        name: 'document element has scroll',
        page: 'http://localhost:3000/fixtures/regression/gh-1940/pages/document-scroll.html'
    },
    {
        name: 'body has scroll',
        page: 'http://localhost:3000/fixtures/regression/gh-1940/pages/body-scroll.html'
    },
    {
        name: 'document and body have scroll',
        page: 'http://localhost:3000/fixtures/regression/gh-1940/pages/document-and-body-have-scroll.html'
    }
];

for (const testCase of testCases) {
    test
        .page(testCase.page)
        (testCase.name, async t => {
            await t
                .click('#aim-bottom')
                .click('#aim-top');

            await removeBodyMargin();

            await t
                .click('#aim-bottom')
                .click('#aim-top');
        });
}


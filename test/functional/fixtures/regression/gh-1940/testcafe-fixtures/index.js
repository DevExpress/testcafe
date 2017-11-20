import { ClientFunction } from 'testcafe';
import { parse } from 'useragent';

const initialWindowSize = {};

const getWindowWidth  = ClientFunction(() => window.innerWidth);
const getWindowHeight = ClientFunction(() => window.innerHeight);
const getUserAgent    = ClientFunction(() => navigator.userAgent.toString());

/*const removeBodyMargin = ClientFunction(() => {
    document.body.style.margin = 0;
});*/

fixture `GH-1940 - Should scroll to element when body has scroll`
    .beforeEach(async t => {
        const ua       = await getUserAgent();
        const parsedUA = parse(ua);

        initialWindowSize[parsedUA.family] = {
            width:  await getWindowWidth(),
            height: await getWindowHeight()
        };

        await t.resizeWindow(700, 400);
    })
    .afterEach(async t => {
        const ua       = await getUserAgent();
        const parsedUA = parse(ua);
        const size     = initialWindowSize[parsedUA.family];

        await t.resizeWindow(size.width, size.height);
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
                .setTestSpeed(0.5)
                .click('#aim-bottom')
                .click('#aim-top');

           /* await removeBodyMargin();

            await t
                .click('#aim-bottom')
                .click('#aim-top');*/
        });
}


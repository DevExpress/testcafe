import { Hybrid } from 'testcafe';
import { parse } from 'useragent';


// NOTE: to preserve callsites, add new tests AFTER the existing ones
fixture `Take a screenshot`
    .page `http://localhost:3000/api/es-next/take-screenshot/pages/index.html`;


const getUserAgent = Hybrid(() => navigator.userAgent.toString());


test('Take a screenshot', async t => {
    await t.takeScreenshot();
});

test('Take a screenshot with a custom path', async t => {
    const ua       = await getUserAgent();
    const parsedUA = parse(ua);

<<<<<<< e8cb9c35813fdf7814793df0504da89b0e0966ab
    await t.takeScreenshot('../../../../../../../___test-screenshots___/custom/' + parsedUA.family);
=======
    await t.takeScreenshot('../../../../screenshots/custom/' + parsedUA.family);
>>>>>>> TakeScreenshot, TakeScreenshotOnFail commands (part of #441, part of #240) (#552)
});

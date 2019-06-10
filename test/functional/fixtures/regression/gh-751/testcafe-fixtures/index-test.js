import { ClientFunction } from 'testcafe';
import { expect } from 'chai';


fixture `GH-751`
    .page `http://localhost:3000/fixtures/regression/gh-751/pages/index.html`;

test('Test dblclick performance', async t => {
    await t.doubleClick('#dblclick');

    const dblclickPerformanceLog = await ClientFunction(() => window.dblclickEvents)();

    let firstMouseupTime  = null;
    let firstClickTime    = null;
    let secondMouseupTime = null;
    let secondClickTime   = null;
    let dblclickTime      = null;

    [firstMouseupTime, firstClickTime, secondMouseupTime, secondClickTime, dblclickTime] = dblclickPerformanceLog;

    expect(firstClickTime - firstMouseupTime).is.most(5);
    expect(secondClickTime - secondMouseupTime).is.most(5);
    expect(dblclickTime - secondClickTime).is.most(5);
});

test('Test click performance with hard work', async t => {
    const HARD_WORK_TIME = await ClientFunction(() => window.HARD_WORK_TIME)();

    await t.click('#hardWorkMousedown');

    const [mousedownTime, mouseupTime] = await ClientFunction(() => window.clickEvents)();

    expect(mouseupTime - mousedownTime).is.most(HARD_WORK_TIME + 40);
});

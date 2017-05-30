import { Selector } from 'testcafe';

fixture `gh-1486`
    .page `http://localhost:3000/fixtures/regression/gh-1486/pages/index.html`;

test('Double click with different speed', async t => {
    const btn = Selector('#btn');

    await t
        .doubleClick(btn)
        .doubleClick(btn, { speed: 0.2 });

    const delays = await t.eval(() => window.delays);

    const fastFirstMouseDownSecondClickDelay = delays[0][0];
    const slowFirstMouseDownSecondClickDelay = delays[1][0];
    const fastClickDblClickDelay             = delays[0][1];
    const slowClickDblClickDelay             = delays[1][1];

    const firstMouseDownSecondClickRatio = slowFirstMouseDownSecondClickDelay / fastFirstMouseDownSecondClickDelay;
    const clickDblClickDiff              = slowClickDblClickDelay - fastClickDblClickDelay;

    const ratioAllowance = 1.5;
    const diffAllowance  = 10;

    await t
        .expect(firstMouseDownSecondClickRatio).lte(ratioAllowance)
        .expect(clickDblClickDiff).lte(diffAllowance);
});

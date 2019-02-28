import { ClientFunction } from 'testcafe';

fixture `GH-3049 - Should increase small browser window`
    .page `http://localhost:3000/fixtures/regression/gh-3049/pages/index.html`;

const getDimensions = ClientFunction(() => {
    return { width: window.innerWidth, height: window.innerHeight };
});

test(`Run browser with minimal window size`, async t => {
    const MIN_AVAILABLE_DIMENSION = 50;
    const { width, height }       = await getDimensions();

    await t.expect(width >= MIN_AVAILABLE_DIMENSION).ok();
    await t.expect(height >= MIN_AVAILABLE_DIMENSION).ok();
});


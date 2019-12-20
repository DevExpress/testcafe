import { ClientFunction } from 'testcafe';


fixture `Compiler service`;

const getClickOffset = ClientFunction(() => window.clickOffset);

test(`Basic test`, async t => {
    await t.expect(String(process.ppid)).eql(process.env.TESTCAFE_PID);

    await t.navigateTo('http://localhost:3000/fixtures/api/es-next/click/pages/index.html');

    await t.click('#div');

    const expectedClickOffset = { x: 50, y: 50 };
    const actualClickOffset   = await getClickOffset();

    await t.expect(actualClickOffset.x).eql(expectedClickOffset.x);
    await t.expect(actualClickOffset.y).eql(expectedClickOffset.y);
});



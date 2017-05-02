import 'testcafe';

fixture('TypeScript callsites');

async function doSmthg(selector: string, t: any): Promise<any> { await (<TestController>t).click(selector); }

test('Test', async(t: TestController) => {
    await doSmthg('#heyheyhey', t);
});

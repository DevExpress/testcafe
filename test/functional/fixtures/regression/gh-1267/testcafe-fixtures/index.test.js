fixture `gh-1267`;

class Page {
    async expect (t) {
        await t.expect(true).ok();
    }
}

async function fn () {

}

test('test', async t => {
    const page = new Page();

    await page.expect(t);
    await fn();
});

import { APIError } from '../../../../../lib/errors/runtime';

fixture `f`;

class Page {
    async expect (t) {
        throw new APIError('expect');
    }
}

async function fn (t) {

}

test('test', async t => {
    const page = new Page();

    await page.expect(t);
});

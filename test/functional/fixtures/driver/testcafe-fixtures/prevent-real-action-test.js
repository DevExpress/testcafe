import { ClientFunction } from 'testcafe';

fixture `Driver`
    .page `http://localhost:3000/fixtures/driver/pages/prevent-real-action.html`;

const performNativeClick  = ClientFunction(() => window['%hammerhead%'].nativeMethods.click.call(document.getElementById('button')));

test('Perform native click', async () => {
    await performNativeClick();
});

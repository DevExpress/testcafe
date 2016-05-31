import { Hybrid } from 'testcafe';

fixture `Driver`
    .page `http://localhost:3000/driver/pages/prevent-real-action.html`;

const performNativeClick  = Hybrid(() => window['%hammerhead%'].nativeMethods.click.call(document.getElementById('button')));

test('Perform native click', async () => {
    await performNativeClick();
});

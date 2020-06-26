import { ClientFunction } from 'testcafe';

fixture `Touch events`;

const EVENT_HANDLERS = ['ontouchstart', 'ontouchend', 'ontouchmove', 'ontouchcancel'];

const hasTouchEventHandlers = ClientFunction(() => {
    var hasOnTouchStart = 'ontouchstart' in window;

    return hasOnTouchStart;
    //return EVENT_HANDLERS.every(handler => handler in window);
}, {
    dependencies: { EVENT_HANDLERS }
});

const getUserAgent = ClientFunction(() => {
    return navigator.userAgent;
});

test('Check presence of touch event handlers', async t => {
    await ClientFunction(() => location.reload(true))();

    console.log(await getUserAgent());

    await t
        .expect(hasTouchEventHandlers()).ok()
        .wait(5000);


});

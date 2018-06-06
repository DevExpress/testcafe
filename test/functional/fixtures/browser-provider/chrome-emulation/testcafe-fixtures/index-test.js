import { ClientFunction } from 'testcafe';

fixture `Touch events`;

const EVENT_HANDLERS = ['ontouchstart', 'ontouchend', 'ontouchmove', 'ontouchcancel'];

const hasTouchEventHandlers = ClientFunction(() => EVENT_HANDLERS.every(handler => handler in window), {
    dependencies: { EVENT_HANDLERS }
});

test('Check presence of touch event handlers', async t => {
    await t.expect(hasTouchEventHandlers()).ok();
});

const { expect } = require('chai');
const utils      = require('./utils');

const {
    CursorState,
    CursorUICdp: Cursor,
} = require('../../lib/browser/provider/built-in/dedicated/chrome/cdp-client/utils/cursor');

const cursor = new Cursor();

// NOTE: we cannot check if the element/rectangle is highlighted
// So this test checks only cursor inner state
describe('cursor utils', () => {
    before(utils.before);
    after(utils.after);
    beforeEach(utils.beforeEach);

    it('show/hide', async () => {
        expect(cursor.isVisible()).eql(false);

        await cursor.show();

        expect(cursor.isVisible()).eql(true);

        for (let i = 0; i < 100; i += 2)
            await cursor.move({ x: i, y: i });

        for (let i = 0; i < 10; i++) {
            await cursor.show();

            expect(cursor.isVisible()).eql(true);

            await cursor.hide();

            expect(cursor.isVisible()).eql(false);
        }

        expect(cursor._state).eql(CursorState.default);

        await cursor.leftButtonDown();
        expect(cursor._state).eql(CursorState.leftButtonDown);

        await cursor.rightButtonDown();
        expect(cursor._state).eql(CursorState.rightButtonDown);

        await cursor.buttonUp();
        expect(cursor._state).eql(CursorState.default);

        expect(cursor.isVisible()).eql(true);
    });
});

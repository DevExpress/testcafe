const { expect }       = require('chai');
const utils            = require('./utils');
const { MoveOptions }  = require('../../lib/test-run/commands/options');
const ExecutionContext = require('../../lib/browser/provider/built-in/dedicated/chrome/cdp-client/execution-context');
const MoveAutomation   = require('../../lib/shared/actions/automations/move');

require('../../lib/browser/provider/built-in/dedicated/chrome/cdp-client/shared-adapter-initializer');

const moveOptions = {
    speed:     0.01,
    offsetX:   23,
    offsetY:   19,
    caretPos:  null,
    modifiers: {
        ctrl:  false,
        alt:   false,
        shift: false,
        meta:  false,
    },
};

describe('MoveAutomation', () => {
    before(utils.before);
    after(utils.after);
    beforeEach(utils.beforeEach);

    it('basic', async () => {
        const el1      = await utils.getNode('#target1');
        const el2      = await utils.getNode('#target2');
        const cursor   = await utils.createCursor();

        const moveOpts = new MoveOptions(moveOptions, false);

        const move1 = await MoveAutomation.create(el1, moveOpts, ExecutionContext.current, cursor);
        const move2 = await MoveAutomation.create(el2, moveOpts, ExecutionContext.current, cursor);

        await move1.run();

        const position1 = await cursor.getPosition();

        await move2.run();

        const position2 = await cursor.getPosition();

        expect(position1).eql({ x: 54, y: 45 });
        expect(position2).eql({ x: 156, y: 118 });
    });

    it('events', async () => {
        const target   = await utils.getNode('#target10');
        const moveOpts = new MoveOptions(moveOptions, false);
        const cursor   = await utils.createCursor();

        const move = await MoveAutomation.create(target, moveOpts, ExecutionContext.current, cursor);

        await move.run();

        const moveLog = await utils.getClient().Runtime.evaluate({
            expression:    'window.moveLog',
            returnByValue: true,
        });

        const logStr = moveLog.result.value.join(' ');
        const logRe  = new RegExp(
            'mouseover: target8 mouseenter: target8 (mousemove: target8 )+(mouseover: target9 ){1,2}mouseenter: target9 ' +
            '(mousemove: target9 )+mouseleave: target9 mouseover: target8 (mousemove: target8 )+(mouseover: target10 ){1,2}' +
            'mouseenter: target10 (mousemove: target10 )+'
        );

        expect(logRe.test(logStr)).eql(true);
    });
});

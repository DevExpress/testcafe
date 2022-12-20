import { Selector } from 'testcafe';

fixture `Click options`
    .page `http://localhost:3000/fixtures/api/es-next/click/pages/options.html`;

test('test', async t => {
    const expectedLoggedEvents = [
        {
            type:      'mousedown',
            button:    0,
            buttons:   1,
            clientX:   13,
            clientY:   85,
            modifiers: {
                'ctrl':  true,
                'alt':   true,
                'shift': true,
                'meta':  true,
            },
        },
        {
            type:      'mouseup',
            button:    0,
            buttons:   0,
            clientX:   13,
            clientY:   85,
            modifiers: {
                'ctrl':  true,
                'alt':   true,
                'shift': true,
                'meta':  true,
            },
        },
        {
            type:      'click',
            button:    0,
            buttons:   0,
            clientX:   13,
            clientY:   85,
            modifiers: {
                'ctrl':  true,
                'alt':   true,
                'shift': true,
                'meta':  true,
            },
        },
    ];

    const expectedCheckedResult = {
        'events': [
            'mousedown',
            'mouseup',
            'click',
        ],
        'sameTimestampForMouseUpAndClick': true,
    };

    await t
        .click('#btn', {
            modifiers: {
                ctrl:  true,
                alt:   true,
                shift: true,
                meta:  true,
            },
            offsetX: 5,
            offsetY: 5,
        })
        .expect(Selector('#eventAreRaised').textContent).eql('Events are raised.');

    const loggedEvents = await t.eval(() => window['loggedEvents']);
    const checkResult  = await t.eval(() => window['checkResult']);

    await t
        .expect(loggedEvents).eql(expectedLoggedEvents)
        .expect(checkResult).eql(expectedCheckedResult);
});

import { Selector, ClientFunction } from 'testcafe';

const btn         = Selector('button');
const firstInput  = Selector('#input1');
const secondInput = Selector('#input2');
const div         = Selector('div');

const getMouseLog    = ClientFunction(() => window.mouseLog);
const getKeyboardLog = ClientFunction(() => window.keyboardLog);
const getInputLog    = ClientFunction(() => window.inputLog);
const getFocusLog    = ClientFunction(() => window.focusLog);
const getPointerLog  = ClientFunction(() => window.pointerLog);

const baseArgs = {
    composed:   true,
    bubbles:    false,
    cancelable: true,
    detail:     3,
};

const keyArgs = {
    altKey:   true,
    ctrlKey:  true,
    shiftKey: true,
    metaKey:  true
};

const mouseEventArgs = Object.assign({}, baseArgs, keyArgs, {
    screenX: 1,
    screenY: 2,
    clientX: 3,
    clientY: 4,
    button:  1,
    buttons: 3
});

const keyboardArgs = Object.assign({}, baseArgs, keyArgs, {
    key:     'q',
    keyCode: 82,
    code:    'KeyT'
});

const inputArgs = Object.assign({}, baseArgs, {
    data:      'test',
    inputType: 'insertText'
});

const focusArgs = Object.assign({}, baseArgs, {
    relatedTarget: secondInput
});

const pointerArgs = Object.assign({}, mouseEventArgs, {
    pointerId:          777,
    width:              11,
    height:             12,
    pressure:           0.5,
    tangentialPressure: 0.6,
    tiltX:              21,
    tiltY:              22,
    twist:              23,
    pointerType:        'pen',
    isPrimary:          true
});

function createExpectedMouseArgs (eventName) {
    return Object.assign({
        type: eventName,
    }, mouseEventArgs);
}

function createExpectedPointerArgs (eventName) {
    return Object.assign({
        type: eventName
    }, pointerArgs);
}

function createExpectedKeyboardArgs (eventName) {
    return Object.assign({
        type: eventName,
    }, keyboardArgs);
}

function createExpectedInputArgs (eventName) {
    return Object.assign({
        type: eventName,
    }, inputArgs);
}

function createExpectedFocusArgs (eventName, relatedTargetId) {
    const result = Object.assign({
        type: eventName,
    }, focusArgs);

    result.relatedTarget = relatedTargetId;

    return result;
}

fixture `Dispatch Event`
    .page `http://localhost:3000/fixtures/api/es-next/dispatch-event/pages/index.html`;

test(`mouse`, async t => {
    await t.dispatchEvent(btn, 'mousedown', mouseEventArgs);
    await t.dispatchEvent(btn, 'mouseup', mouseEventArgs);
    await t.dispatchEvent(btn, 'click', mouseEventArgs);

    await t.expect(getMouseLog()).eql([
        createExpectedMouseArgs('mousedown'),
        createExpectedMouseArgs('mouseup'),
        createExpectedMouseArgs('click')
    ]);
});

test(`no options`, async t => {
    await t.dispatchEvent(btn, 'mousedown');

    await t.expect(getMouseLog()).eql([{
        altKey:     false,
        bubbles:    true,
        button:     0,
        buttons:    1,
        cancelable: true,
        clientX:    0,
        clientY:    0,
        composed:   false,
        ctrlKey:    false,
        detail:     1,
        metaKey:    false,
        screenX:    0,
        screenY:    0,
        shiftKey:   false,
        type:       'mousedown'
    }]);
});

test(`keyboard`, async t => {
    await t.dispatchEvent(firstInput, 'keypress', keyboardArgs);
    await t.dispatchEvent(firstInput, 'keydown', keyboardArgs);
    await t.dispatchEvent(firstInput, 'keyup', keyboardArgs);

    await t.expect(getKeyboardLog()).eql([
        createExpectedKeyboardArgs('keypress'),
        createExpectedKeyboardArgs('keydown'),
        createExpectedKeyboardArgs('keyup'),
    ]);
});

test(`input`, async t => {
    await t.dispatchEvent(firstInput, 'beforeinput', inputArgs);
    await t.dispatchEvent(firstInput, 'input', inputArgs);

    const args = [ createExpectedInputArgs('beforeinput'), createExpectedInputArgs('input') ];

    // NOTE: Safari does not set the `inputType` option in `dispatchEvent` method.
    if (t.browser.name === 'Safari') {
        args.forEach(arg => {
            arg.inputType = '';
        });
    }

    await t.expect(getInputLog()).eql(args);
});

test(`focus`, async t => {
    await t.dispatchEvent(firstInput, 'focus', focusArgs);
    await t.dispatchEvent(firstInput, 'focusin', focusArgs);
    await t.dispatchEvent(firstInput, 'focusout', focusArgs);
    await t.dispatchEvent(firstInput, 'blur', focusArgs);

    await t.expect(getFocusLog()).eql([
        createExpectedFocusArgs('focus', 'input2'),
        createExpectedFocusArgs('focusin', 'input2'),
        createExpectedFocusArgs('focusout', 'input2'),
        createExpectedFocusArgs('blur', 'input2')
    ]);
});

test(`pointer`, async t => {
    await t.dispatchEvent(firstInput, 'pointerover', pointerArgs);
    await t.dispatchEvent(firstInput, 'pointerenter', pointerArgs);
    await t.dispatchEvent(firstInput, 'pointerdown', pointerArgs);
    await t.dispatchEvent(firstInput, 'pointermove', pointerArgs);
    await t.dispatchEvent(firstInput, 'pointerrawupdate', pointerArgs);
    await t.dispatchEvent(firstInput, 'pointerup', pointerArgs);
    await t.dispatchEvent(firstInput, 'pointercancel', pointerArgs);
    await t.dispatchEvent(firstInput, 'pointerout', pointerArgs);
    await t.dispatchEvent(firstInput, 'pointerleave', pointerArgs);

    await t.expect(getPointerLog()).eql([
        createExpectedPointerArgs('pointerover'),
        createExpectedPointerArgs('pointerenter'),
        createExpectedPointerArgs('pointerdown'),
        createExpectedPointerArgs('pointermove'),
        createExpectedPointerArgs('pointerrawupdate'),
        createExpectedPointerArgs('pointerup'),
        createExpectedPointerArgs('pointercancel'),
        createExpectedPointerArgs('pointerout'),
        createExpectedPointerArgs('pointerleave')
    ]);
});

test('defaults', async t => {
    await t.dispatchEvent(btn, 'mousedown');

    await t.dispatchEvent(btn, 'mousedown', {
        bubbles:    false,
        cancelable: false,
        detail:     2,
        button:     1,
        buttons:    2
    });

    const log = await getMouseLog();

    await t.expect(log[0].bubbles).eql(true);
    await t.expect(log[0].cancelable).eql(true);
    await t.expect(log[0].detail).eql(1);
    await t.expect(log[0].button).eql(0);
    await t.expect(log[0].buttons).eql(1);

    await t.expect(log[1].bubbles).eql(false);
    await t.expect(log[1].cancelable).eql(false);
    await t.expect(log[1].detail).eql(2);
    await t.expect(log[1].button).eql(1);
    await t.expect(log[1].buttons).eql(2);
});

test('predifined ctor', async t => {
    await t.dispatchEvent(btn, 'customEvent', { eventConstructor: 'MouseEvent' });

    await t.expect(getMouseLog()).eql([{ isMouseEvent: true, isCustomEvent: false, detail: 0, type: 'customEvent' }]);
});

test('custom event', async t => {
    await t.dispatchEvent(btn, 'customEvent', { detail: { data: 'testing' } });

    await t.expect(getMouseLog()).eql([{
        isMouseEvent:  false,
        isCustomEvent: true,
        type:          'customEvent',
        detail:        { data: 'testing' }
    }]);
});

test.page('http://localhost:3000/fixtures/api/es-next/dispatch-event/pages/drag.html')('simple drag', async t => {
    let initialTop  = parseInt(await div.getStyleProperty('top'), 10);
    let initialLeft = parseInt(await div.getStyleProperty('left'), 10);

    await t.dispatchEvent(div, 'mousedown');

    for (let i = 0; i < 10; i++) {
        await t.dispatchEvent(div, 'mousemove', {
            clientX: i * 10,
            clientY: i * 20
        });

        await t.expect(parseInt(await div.getStyleProperty('top'), 10)).eql(initialTop);
        await t.expect(parseInt(await div.getStyleProperty('left'), 10)).eql(initialLeft);

        initialTop  += 20;
        initialLeft += 10;
    }

    await t.dispatchEvent(div, 'mouseup');
});

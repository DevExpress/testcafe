import TYPE from '../../../../test-run/commands/type';

const DEVTOOLS_COMMAND_TYPE = {
    navigate:          'navigate',
    setViewport:       'setViewport',
    click:             'click',
    change:            'change',
    keyDown:           'keyDown',
    keyUp:             'keyUp',
    scroll:            'scroll',
    waitForExpression: 'waitForExpression',
    waitForElement:    'waitForElement',
    close:             'close',
}


class CommandTransformerBase {
    constructor (step, type, callsite) {
        this.type     = type;
        this.callsite = callsite;
    }

    transform () {
        const result = { type: this.type };

        for (const prop of this._getAssignableProperties())
            result[prop] = this[prop];

        return result;
    }

    _getCorrectSelector (step) {
        if (!step.selectors || !step.selectors.length)
            return null;

        const selector = step.selectors[1] || step.selectors[0];

        let timeoutStr = '';

        if (step.timeout)
            timeoutStr += `, { timeout: ${step.timeout} }`;

        return `Selector('${selector}'${timeoutStr})`;
    }

    _getAssignableProperties () {
        return [];
    }
}

export class SwitchToMainWindowCommandTransformer extends CommandTransformerBase {
    constructor (step, callsite) {
        super(step, TYPE.switchToMainWindow, callsite);
    }
}

class SelectorCommandTransformerBase extends CommandTransformerBase {
    constructor (step, type, callsite) {
        super(step, type, callsite);

        const selector = this._getCorrectSelector(step);

        if (selector) {
            this.selector = {
                type:  'js-expr',
                value: selector,
            };
        }
    }

    _getAssignableProperties () {
        return ['selector'];
    }
}

export class SwitchToIframeCommandTransformer extends SelectorCommandTransformerBase {
    constructor (frame, callsite) {
        super(frame, TYPE.switchToIframe, callsite);
    }

    _getCorrectSelector (frame) {
        console.log('_getCorrectSelector: ' + frame);
        return `Selector(() => { debugger; return window.frames[${frame}].frameElement; })`;
    }
}



class NavigateCommandTransformer extends CommandTransformerBase {
    constructor (step, callsite) {
        super(step, TYPE.navigateTo, callsite);

        this.url = step.url;
    }

    _getAssignableProperties () {
        return ['url'];
    }
}

class SetViewportCommandTransformer extends CommandTransformerBase {
    constructor (step, callsite) {
        super(step, TYPE.resizeWindow, callsite);

        this.width  = step.width;
        this.height = step.height;
    }

    _getAssignableProperties () {
        return ['width', 'height'];
    }
}

class ClickCommandTransformer extends SelectorCommandTransformerBase {
    constructor (step, callsite) {
        super(step, TYPE.click, callsite);

        this.options = {};

        if (step.offsetX)
            this.options.offsetX = Math.floor(step.offsetX);

        if (step.offsetY)
            this.options.offsetY = Math.floor(step.offsetY);
    }

    _getAssignableProperties () {
        return super._getAssignableProperties().concat(['options']);
    }
}

class ScrollCommandTransformer extends SelectorCommandTransformerBase {
    constructor (step, callsite) {
        super(step, TYPE.scroll, callsite);

        if (!this.selector)
            this.selector = 'html';

        if (step.x)
            this.x = Math.floor(step.x);

        if (step.y)
            this.y = Math.floor(step.y);
    }

    _getAssignableProperties () {
        return super._getAssignableProperties().concat(['x', 'y']);
    }
}

class ExecuteExpressionCommandTransformerBase extends CommandTransformerBase {
    constructor (step, callsite) {
        super(step, TYPE.executeAsyncExpression, callsite);
    }

    _getAssignableProperties () {
        return ['expression'];
    }
}

class KeyDownCommandTransformer extends ExecuteExpressionCommandTransformerBase {
    constructor (step, callsite) {
        super(step, callsite);

        this.expression = `
            await t.dispatchEvent(Selector(() => document.activeElement), 'keydown', { key: '${step.key}'});
            await t.dispatchEvent(Selector(() => document.activeElement), 'keypress', { key: '${step.key}'});
        `;
    }
}

class KeyUpCommandTransformer extends ExecuteExpressionCommandTransformerBase {
    constructor (step, callsite) {
        super(step, callsite);

        this.expression = `
            await t.dispatchEvent(Selector(() => document.activeElement), 'keyup', { key: '${step.key}'});
        `;
    }
}

class ChangeCommandTransformer extends ExecuteExpressionCommandTransformerBase {
    constructor (step, callsite) {
        super(step, callsite);

        this.expression = `
            const selector = ${this._getCorrectSelector(step)};
            const { tagName } = await selector();
            
            if (tagName === 'input' || tagName === 'textarea')
                await t.typeText(selector, '${step.value}');
            else if (tagName === 'select') {
                await t.click(selector.find('option').filter(option => {
                    return option.value === '${step.value}';
                }))
            }
        `;
    }
}

class WaitForExpressionCommandTransformer extends ExecuteExpressionCommandTransformerBase {
    constructor (step, callsite) {
        super(step, callsite);

        this.expression = `
            const fn = ClientFunction(() => {
                return ${step.expression}
            });
            
            await t.expect(fn()).eql(true);
        `;
    }
}

class WaitForElementCommandTransformer extends ExecuteExpressionCommandTransformerBase {
    constructor (step, callsite) {
        super(step, callsite);

        this.expression = `
            const selector = ${this._getCorrectSelector(step)};
                       
            await t.expect(selector.count).${this._getOperatorMethodName(step.operator)}(${step.count || 1});
        `;
    }

    _getOperatorMethodName (operator) {
        switch (operator) {
            case '>=': return 'gte';
            case '<=': return 'lte';
            case '==': return 'eql';
        }

        return 'gte';
    }
}

export class CommandTransformerFactory {
    static create (step, callsite) {
        switch (step.type) {
            case DEVTOOLS_COMMAND_TYPE.navigate: return new NavigateCommandTransformer(step, callsite);
            case DEVTOOLS_COMMAND_TYPE.setViewport: return new SetViewportCommandTransformer(step, callsite);
            case DEVTOOLS_COMMAND_TYPE.click: return new ClickCommandTransformer(step, callsite);
            case DEVTOOLS_COMMAND_TYPE.change: return new ChangeCommandTransformer(step, callsite);
            case DEVTOOLS_COMMAND_TYPE.keyDown: return new KeyDownCommandTransformer(step, callsite);
            case DEVTOOLS_COMMAND_TYPE.keyUp: return new KeyUpCommandTransformer(step, callsite);
            case DEVTOOLS_COMMAND_TYPE.scroll: return new ScrollCommandTransformer(step, callsite);
            case DEVTOOLS_COMMAND_TYPE.waitForExpression: return new WaitForExpressionCommandTransformer(step, callsite);
            case DEVTOOLS_COMMAND_TYPE.waitForElement: return new WaitForElementCommandTransformer(step, callsite);
            case DEVTOOLS_COMMAND_TYPE.close: return null;
        }

        throw new Error('Incorrect command: ' + step.type);
    }
}

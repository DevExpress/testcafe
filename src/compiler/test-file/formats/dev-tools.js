import RawTestFileCompiler from './raw';

const TEST_BASE = {
    fixtures: [
        {
            name:  'New Fixture',
            tests: [
                {
                    name:     'New Test',
                    commands: [],
                },
            ],
        },
    ],
};

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

    _getCorrectSelector(step) {
        return step.selectors[1] || step.selectors[0];
    }

    _getAssignableProperties () {
        return ['type'];
    }
}

class NavigateCommandTransformer extends CommandTransformerBase {
    constructor (step, callsite) {
        super(step, 'navigate-to', callsite);

        this.url = step.url;
    }

    _getAssignableProperties () {
        return ['url'];
    }
}

class SetViewportCommandTransformer extends CommandTransformerBase {
    constructor (step, callsite) {
        super(step, 'resize-window', callsite);

        this.width  = step.width;
        this.height = step.height;
    }

    _getAssignableProperties () {
        return ['width', 'height'];
    }
}

class ClickCommandTransformer extends CommandTransformerBase {
    constructor (step, callsite) {
        super(step, 'click', callsite);

        this.selector = {
            type:  'js-expr',
            value: `Selector('${this._getCorrectSelector(step)}')`,
        };

        this.options = {
            offsetX: Math.floor(step.offsetX),
            offsetY: Math.floor(step.offsetY),
        };
    }

    _getAssignableProperties () {
        return ['selector', 'options'];
    }
}

class ExecuteExpressionCommandTransformerBase extends CommandTransformerBase {
    constructor (step, callsite) {
        super(step, 'execute-async-expression', callsite);
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
            const selector = Selector('${this._getCorrectSelector(step)}');
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


class CommandTransformerFactory {
    static create (step, callsite) {
        switch (step.type) {
            case 'navigate': return new NavigateCommandTransformer(step, callsite);
            case 'setViewport': return new SetViewportCommandTransformer(step, callsite);
            case 'click': return new ClickCommandTransformer(step, callsite);
            case 'change': return new ChangeCommandTransformer(step, callsite);
            case 'keyDown': return new KeyDownCommandTransformer(step, callsite);
            case 'keyUp': return new KeyUpCommandTransformer(step, callsite);
        }

        return null;
    }
}

export default class DevToolsTestFileCompiler extends RawTestFileCompiler {
    _hasTests () {
        return true;
    }

    getSupportedExtension () {
        return '.json';
    }

    compile (code, filename) {
        this.raw = Object.assign({}, TEST_BASE);

        return super.compile(this._preProcess(code), filename);
    }

    _preProcess (code) {
        const parsedCode = JSON.parse(code);

        parsedCode.steps.forEach((step, i) => this._processStep(step, i));

        return JSON.stringify(this.raw);
    }

    _processStep (step, i) {
        const transformer = CommandTransformerFactory.create(step, i);
        const test        = this.raw.fixtures[0].tests[0];

        if (transformer)
            test.commands.push(transformer.transform());
    }
}

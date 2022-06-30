import { DevToolsRecorderStep, RawCommand } from '../types';

export class CommandTransformerBase {
    private readonly type: string;
    private callsite: number;

    constructor (step: DevToolsRecorderStep, type: string, callsite: number) {
        this.type     = type;
        this.callsite = callsite;
    }

    transform (): RawCommand {
        const result: RawCommand  = { type: this.type };

        for (const prop of this._getAssignableProperties()) {
            // @ts-ignore
            result[prop] = this[prop];
        }

        return result;
    }

    _escapeSpecialCharacters (value: string | undefined): string {
        const stringifiedValue = JSON.stringify(value);

        return stringifiedValue.substr(1, stringifiedValue.length - 2);
    }

    _getCorrectSelector (step: DevToolsRecorderStep): string | null {
        const selectors = step.selectors as string[];

        if (!selectors || !selectors.length)
            return null;

        let selector = selectors[1] || selectors[0];

        if (Array.isArray(selector))
            selector = `Selector("${selector.join('").shadowRoot().find("')}")`;
        else
            selector = `Selector('${selector}')`;

        let timeoutStr = '';

        if (step.timeout)
            timeoutStr += `, { timeout: ${step.timeout} }`;

        return `Selector(${selector}${timeoutStr})`;
    }

    _getAssignableProperties (): string[] {
        return [];
    }
}

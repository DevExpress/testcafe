import chalk from 'chalk';
import { camelCase, upperFirst } from 'lodash';

interface Step {
    callsite: number;
    selector?: {
        type: string;
        value: string;
    };
    type: string;
    assertionType?: string;
    [key: string]: unknown;
}

interface RenderOptions {
    frameSize?: number;
}

class CallsiteCommand {
    private readonly _id: number;
    private readonly _list: Step[];

    public constructor (id: number, list: Step[]) {
        this._id   = id;
        this._list = list;
    }

    public renderSync (opts: RenderOptions): string {
        const {
            frameSize = 1,
        } = opts;

        const baseId = this._list.findIndex(item => item.callsite === this._id);

        if (baseId < 0)
            return '';

        const firstId = Math.max(baseId - frameSize, 0);
        const lastId  = Math.min(baseId + frameSize, this._list.length - 1);
        let frame     = '';

        for (let i = firstId; i <= lastId; i++)
            frame += CallsiteCommand._stepLine(i + 1, this._list[i], i === baseId);

        return frame;
    }

    private static _stepLine (num: number, step: Step, base: boolean): string {
        const {
            type,
            assertionType,
            selector,
        } = step;

        let stepNum = `${base ? ' > ' : '   '}${num} `;

        if (base)
            stepNum = chalk.bgRed(stepNum);

        return `${stepNum}|${upperFirst(camelCase(assertionType || type))} ${selector ? `(${selector.value})` : ''}\n`;
    }
}

export default CallsiteCommand;

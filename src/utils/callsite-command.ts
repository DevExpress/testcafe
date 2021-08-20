import chalk from 'chalk';
import { camelCase, upperFirst } from 'lodash';

interface Command {
    id: number;
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
    public readonly id: number;
    private readonly _list: Command[];

    public constructor (id: number, list: Command[]) {
        this.id   = id;
        this._list = list;
    }

    public renderSync (opts: RenderOptions): string {
        const {
            frameSize = 1,
        } = opts;

        const baseId = this._list.findIndex(item => item.id === this.id);

        if (baseId < 0)
            return '';

        const firstId = Math.max(baseId - frameSize, 0);
        const lastId  = Math.min(baseId + frameSize, this._list.length - 1);
        let frame     = '';

        for (let i = firstId; i <= lastId; i++)
            frame += CallsiteCommand._commandLine(i + 1, this._list[i], i === baseId);

        return frame;
    }

    private static _commandLine (num: number, command: Command, base: boolean): string {
        const {
            type,
            assertionType,
            selector,
        } = command;

        let commandNum = `${base ? ' > ' : '   '}${num} `;

        if (base)
            commandNum = chalk.bgRed(commandNum);

        return `${commandNum}|${upperFirst(camelCase(assertionType || type))} ${selector ? `(${selector.value})` : ''}\n`;
    }
}

export default CallsiteCommand;

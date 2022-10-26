import chalk from 'chalk';
import { camelCase, upperFirst } from 'lodash';

interface Command {
    id: number;
    selector?: {
        type: string;
        value: string;
    };
    actual?: {
        type: string;
        value: string;
    };
    expected?: {
        type: string;
        value: string;
    };
    type: string;
    assertionType?: string;
    [key: string]: unknown;
}

export class Render {
    public static getCommandStr (command: Command): string {
        const {
            type,
            assertionType,
            selector,
            actual,
            expected,
        } = command;

        const mainStr = `${upperFirst(camelCase(type))} (${(assertionType ? actual?.value : selector?.value) || ''})`;
        const subStr  = assertionType ? ` ${assertionType} (${expected?.value || ''})` : '';

        return `${mainStr}${subStr}`;
    }
    public static codeFrame (str: string): string {
        return str;
    }
    public static commandLine (num: number, command: Command, base: boolean): string {
        let commandNum = `${base ? ' > ' : '   '}${num} `;

        if (base)
            commandNum = chalk.bgRed(commandNum);

        return `${commandNum}|${Render.getCommandStr(command)}\n`;
    }
}

export class NoColorRender extends Render {
    public static commandLine (num: number, command: Command, base: boolean): string {
        const commandNum = `${base ? ' > ' : '   '}${num} `;

        return `${commandNum}|${Render.getCommandStr(command)}\n`;
    }
}

export class HtmlRender extends Render {
    public static codeFrame (str: string): string {
        return '<div class="code-frame">' + str + '</div>';
    }

    public static commandLine (num: number, command: Command, base: boolean): string {
        const numClass  = base ? 'code-line-num-base' : 'code-line-num';

        return `<div class="code-line">` +
            `<div class="${numClass}">${num}</div>` +
            `<div class="code-line-src">${Render.getCommandStr(command)}</div>` +
            `</div>`;
    }
}

interface RenderOptions {
    renderer?: typeof Render;
    frameSize?: number;
    codeFrame?: boolean;
}

export const renderers = {
    default: Render,
    html:    HtmlRender,
    noColor: NoColorRender,
};

export class RawCommandCallsiteRecord {
    public readonly actionId: string;
    private readonly _list: Command[];

    public constructor (actionId: string, list: Command[]) {
        this.actionId = actionId;
        this._list    = list;
    }

    public renderSync (opts: RenderOptions): string {
        const {
            renderer = Render,
            frameSize = 1,
            codeFrame = true,
        } = opts;

        if (!codeFrame)
            return '';

        const baseId = this._list.findIndex(item => item.actionId === this.actionId);

        if (baseId < 0)
            return '';

        const firstId = Math.max(baseId - frameSize, 0);
        const lastId  = Math.min(baseId + frameSize, this._list.length - 1);
        let frame     = '';

        for (let i = firstId; i <= lastId; i++)
            frame += renderer.commandLine(i + 1, this._list[i], i === baseId);

        return renderer.codeFrame(frame);
    }
}

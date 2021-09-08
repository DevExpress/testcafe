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

export class Render {
    public static codeFrame (str: string): string {
        return str;
    }
    public static commandLine (num: number, command: Command, base: boolean): string {
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

export class NoColorRender extends Render {
    public static commandLine (num: number, command: Command, base: boolean): string {
        const {
            type,
            assertionType,
            selector,
        } = command;
        const commandNum = `${base ? ' > ' : '   '}${num} `;

        return `${commandNum}|${upperFirst(camelCase(assertionType || type))} ${selector ? `(${selector.value})` : ''}\n`;
    }
}

export class HtmlRender extends Render {
    public static codeFrame (str: string): string {
        return '<div class="code-frame">' + str + '</div>';
    }

    public static commandLine (num: number, command: Command, base: boolean): string {
        const {
            type,
            assertionType,
            selector,
        } = command;
        const numClass  = base ? 'code-line-num-base' : 'code-line-num';

        return `<div class="code-line">` +
            `<div class="${numClass}">${num}</div>` +
            `<div class="code-line-src">${upperFirst(camelCase(assertionType || type))} ${selector ? `(${selector.value})` : ''}</div>` +
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
    public readonly id: number;
    private readonly _list: Command[];

    public constructor (id: number, list: Command[]) {
        this.id   = id;
        this._list = list;
    }

    public renderSync (opts: RenderOptions): string {
        const {
            renderer = Render,
            frameSize = 1,
            codeFrame = true,
        } = opts;

        if (!codeFrame)
            return '';

        const baseId = this._list.findIndex(item => item.id === this.id);

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

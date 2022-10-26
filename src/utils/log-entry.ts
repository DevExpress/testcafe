import indentString from 'indent-string';
import { inspect } from 'util';
import { Debugger } from 'debug';

const OPTIONS = {
    isTestCafeInspect: true,
    compact:           false,
};

export default function (logger: Debugger, data: unknown): void {
    try {
        const entry = data
            // @ts-ignore
            ? indentString(`\n${inspect(data, OPTIONS)}\n`, ' ', 4)
            : '';

        logger(entry);
    }
    catch (e: any) {
        logger(e.stack ? e.stack : String(e));
    }
}

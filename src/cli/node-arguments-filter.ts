export const V8_DEBUG_FLAGS = [
    '--inspect',
    '--inspect-brk',
];

export const V8_FLAGS = [
    ...V8_DEBUG_FLAGS,
    'debug',
    '--expose-gc',
    '--gc-global',
    '--es_staging',
    '--no-deprecation',
    '--prof',
    '--log-timer-events',
    '--throw-deprecation',
    '--trace-deprecation',
    '--use_strict',
    '--allow-natives-syntax',
    '--perf-basic-prof',
    '--experimental-repl-await',
];

export const V8_FLAG_PREFIXES = [
    '--harmony',
    '--trace',
    '--icu-data-dir',
    '--max-old-space-size',
    '--preserve-symlinks',
];

function isNodeFlagPrefix (arg: string): boolean {
    return V8_FLAG_PREFIXES.some(flagPrefix => {
        return arg.indexOf(flagPrefix) === 0;
    });
}

interface ParsedArgs {
    args: string[];
    v8Flags?: string[];
}

export function extractNodeProcessArguments (cliArgs: string[]): ParsedArgs {
    const args: string[] = [];
    const v8Flags: string[] = [];

    cliArgs.forEach(arg => {
        const flag = arg.split('=')[0];

        if (V8_FLAGS.indexOf(flag) > -1 || isNodeFlagPrefix(arg))
            v8Flags.push(arg);
        else
            args.push(arg);
    });

    return { args, v8Flags: v8Flags.length ? v8Flags : void 0 };
}

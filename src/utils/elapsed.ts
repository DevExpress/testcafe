const prettyTime = require('pretty-hrtime');

export function elapsed (): () => string {
    const start = process.hrtime();

    return () => prettyTime(process.hrtime(start));
}

export function elapsedInSeconds (): () => number {
    const start = process.hrtime();

    return () => {
        const [ seconds ] = process.hrtime(start);

        return seconds;
    };
}

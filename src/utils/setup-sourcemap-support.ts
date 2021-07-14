import sourceMapSupport from 'source-map-support';

export default function (): void {
    sourceMapSupport.install({
        hookRequire:              true,
        handleUncaughtExceptions: false,
        environment:              'node',
    });
}

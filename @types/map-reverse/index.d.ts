declare module 'map-reverse' {
    function mapReverse<T>(array: T[], callback: (item: T, index: number, currentArray: readonly T[]) => unknown): T[];

    export = mapReverse;
}

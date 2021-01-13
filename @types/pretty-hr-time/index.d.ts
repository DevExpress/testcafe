declare module 'pretty-hrtime' {
    namespace prettyHrtime {
        interface Options {
            verbose?: boolean;
            precise?: boolean;
        }
    }

    function prettyHrtime(hrTime: [number, number], options?: prettyHrtime.Options): string;

    export = prettyHrtime;
}

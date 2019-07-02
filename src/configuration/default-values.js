export const DEFAULT_TIMEOUT = {
    selector:  10000,
    assertion: 3000,
    pageLoad:  3000
};

export const DEFAULT_SPEED_VALUE = 1;

export const STATIC_CONTENT_CACHING_SETTINGS = {
    maxAge:         3600,
    mustRevalidate: false
};

export const DEFAULT_APP_INIT_DELAY = 1000;

export const DEFAULT_CONCURRENCY_VALUE = 1;

export const DEFAULT_TYPESCRIPT_COMPILER_OPTIONS = {
    experimentalDecorators:  true,
    emitDecoratorMetadata:   true,
    allowJs:                 true,
    pretty:                  true,
    inlineSourceMap:         true,
    noImplicitAny:           false,
    module:                  1 /* ts.ModuleKind.CommonJS */,
    target:                  2 /* ES6 */,
    suppressOutputPathCheck: true,
    skipLibCheck:            true
};

export const TYPESCRIPT_COMPILER_NON_OVERRIDABLE_OPTIONS = ['module', 'target'];

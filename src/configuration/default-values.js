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
    moduleResolution:        2 /* ts.ModuleResolutionKind.Node */,
    target:                  3 /* ts.ScriptTarget.ES2016 */,
    suppressOutputPathCheck: true,
    skipLibCheck:            true
};

export const TYPESCRIPT_COMPILER_NON_OVERRIDABLE_OPTIONS = ['module', 'moduleResolution', 'target'];

export const TYPESCRIPT_BLACKLISTED_OPTIONS = [
    'incremental',
    'tsBuildInfoFile',
    'emitDeclarationOnly',
    'declarationMap',
    'declarationDir',
    'composite',
    'outFile',
    'out'
];

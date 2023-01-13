
// {{#allowReferences}}
/// <reference path="./options.d.ts" />
// {{/allowReferences}}


interface TestCafeConfigurationOptions extends RunOptions, StartOptions {
    appCommand: AppOptions['command'];
    appInitDelay: AppOptions['initDelay'];

    concurrency: ConcurrencyOption;

    browsers: BrowserOptions;

    src: SourceOptions;

    reporter: ReporterOptions;

    screenshots: ScreenshotsOptions;

    proxy: ProxyOptions['host'];
    proxyBypass: ProxyOptions['bypassRules'];

    videoPath: VideoConfigOptions['path'];
    videoOptions: VideoConfigOptions['options'];
    videoEncodingOptions: VideoConfigOptions['encodingOptions'];

    filter: FilterDescriptor;

    clientScripts: ClientScriptOptions;

    compilerOptions: CompilerOptions;
}

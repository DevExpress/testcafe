export interface CompilerArguments {
    sourceList: string[];
    compilerOptions?: CompilerOptions;
    runnableConfigurationId: string;
}

export interface OptionalCompilerArguments {
    isCompilerServiceMode?: boolean;
    baseUrl?: string;
    experimentalEsm?: boolean;
}

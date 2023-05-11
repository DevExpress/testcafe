export interface CompilerArguments {
    sourceList: string[];
    compilerOptions?: CompilerOptions;
    runnableConfigurationId: string;
}

export interface OptionalCompilerArguments {
    baseUrl?: string;
    esm?: boolean;
}

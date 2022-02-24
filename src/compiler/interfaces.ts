export interface CompilerArguments {
    sourceList: string[];
    compilerOptions?: CompilerOptions;
    runnableConfigurationId: string;
}

export interface AdditionalCompilerArguments {
    isCompilerServiceMode?: boolean;
    baseUrl?: string
}

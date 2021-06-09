interface UserConfig {
    [key: string]: unknown;
}

interface UserConfigFactory {
    (): UserConfig;
}

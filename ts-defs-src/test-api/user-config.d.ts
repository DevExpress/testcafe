
// User Config
//----------------------------------------------------------------------------------------------------------------------

interface UserConfig {
    /**
     * Custom property
     */
    [key: string]: unknown;
}

interface UserConfigFactory {
    (): UserConfig;
}

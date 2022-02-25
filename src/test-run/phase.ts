enum TestRunPhase {
    initial = 'initial',
    inTestRunBeforeHook = 'inTestRunBeforeHook',
    inFixtureBeforeHook = 'inFixtureBeforeHook',
    inFixtureBeforeEachHook = 'inFixtureBeforeEachHook',
    inTestBeforeHook = 'inTestBeforeHook',
    inTest = 'inTest',
    inTestAfterHook = 'inTestAfterHook',
    inFixtureAfterEachHook = 'inFixtureAfterEachHook',
    inFixtureAfterHook = 'inFixtureAfterHook',
    inTestRunAfterHook = 'inTestRunAfterHook',
    inRoleInitializer = 'inRoleInitializer',
    inBookmarkRestore = 'inBookmarkRestore',
    pendingFinalization = 'pendingFinalization'
}

export default TestRunPhase;

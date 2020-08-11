enum ReporterPluginMethod {
    TaskStart = 'reportTaskStart',
    FixtureStart = 'reportFixtureStart',
    TestStart = 'reportTestStart',
    TestActionStart = 'reportTestActionStart',
    TestActionDone = 'reportTestActionDone',
    TestDone = 'reportTestDone',
    TaskDone = 'reportTaskDone'
}

export default ReporterPluginMethod;

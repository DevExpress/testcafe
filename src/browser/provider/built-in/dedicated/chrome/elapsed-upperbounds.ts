export enum SlowCDPMethod {
    PageEnable = 'PageEnable',
    SetDeviceMetricsOverride = 'Emulation.SetDeviceMetricsOverride',
    SetVisibleSize = 'Emulation.SetVisibleSize'
}

// NOTE: CDP calls heuristic time upperbounds in seconds
export const ELAPSED_TIME_UPPERBOUNDS = {
    [SlowCDPMethod.PageEnable]:               30,
    [SlowCDPMethod.SetDeviceMetricsOverride]: 30,
    [SlowCDPMethod.SetVisibleSize]:           30
};

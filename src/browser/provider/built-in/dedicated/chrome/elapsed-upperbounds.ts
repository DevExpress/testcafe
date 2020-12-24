export enum CheckedCDPMethod {
    PageEnable = 'PageEnable',
    SetDeviceMetricsOverride = 'Emulation.SetDeviceMetricsOverride',
    SetVisibleSize = 'Emulation.SetVisibleSize'
}

// NOTE: CDP calls heuristic time upperbounds in seconds
export const ELAPSED_TIME_UPPERBOUNDS = {
    [CheckedCDPMethod.PageEnable]:               30,
    [CheckedCDPMethod.SetDeviceMetricsOverride]: 30,
    [CheckedCDPMethod.SetVisibleSize]:           30
};

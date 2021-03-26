interface AutomationPoint {
    x: number;
    y: number;
}

export interface EnsureElementResult {
    element: HTMLElement;
    clientPoint: AutomationPoint;
    screenPoint: AutomationPoint;
    devicePoint: AutomationPoint;
}

export interface EnsureElementResultArgs {
    point: AutomationPoint;
    screenPoint: AutomationPoint;
    element: HTMLElement;
    options: unknown;
}

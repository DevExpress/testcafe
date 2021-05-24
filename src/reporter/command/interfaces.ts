export interface FormattedCommand {
    [key: string]: unknown;
    type: string;
}

export interface SelectorInfo {
    expression: string;
    timeout?: number;
    element?: HTMLElement;
}

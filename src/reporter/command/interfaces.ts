export interface Command {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
    type: string;
    _getAssignableProperties(): { name: string }[];
}

export interface FormattedCommand {
    [key: string]: unknown;
    type: string;
}

export interface SelectorInfo {
    expression: string;
    element?: HTMLElement;
}

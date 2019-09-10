export interface LiveModeController {
    stop (): Promise<void>;
    restart (): Promise<void>;
    exit (): Promise<void>;
    toggleWatching (): void;
}

export interface LiveModeController {
    _stop (): Promise<void>;
    _restart (): Promise<void>;
    _exit (): Promise<void>;
    _toggleWatching (): void;
}

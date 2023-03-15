declare module 'endpoint-utils' {
    export function getFreePort(): Promise<number>;
    export function isFreePort(port: number): Promise<boolean>;
    export function getIPAddress(): string;
    export function isMyHostname(hostname: string): Promise<boolean>;
}

declare module 'chrome-remote-interface' {
    namespace chromeRemoteInterface {
        export type ProtocolApi = import('devtools-protocol/types/protocol-proxy-api').ProtocolProxyApi.ProtocolApi;

        export type ProtocolTargetInfo = import('devtools-protocol/types/protocol').Protocol.Target.TargetInfo;

        export interface TargetInfo extends ProtocolTargetInfo {
            id: string;
        }

        export interface GenericConnectionOptions {
            port: number;
        }

        export interface ConstructorOptions extends GenericConnectionOptions {
            target: TargetInfo;
        }

        export interface CloseTabOptions extends GenericConnectionOptions {
            id: TargetInfo['id'];
        }
    }

    interface ChromeRemoteInterface {
        (options: chromeRemoteInterface.ConstructorOptions): Promise<chromeRemoteInterface.ProtocolApi>;
        listTabs (options: chromeRemoteInterface.GenericConnectionOptions): Promise<chromeRemoteInterface.TargetInfo[]>;
        closeTab (options: chromeRemoteInterface.CloseTabOptions): Promise<void>;
    }

    const chromeRemoteInterface: ChromeRemoteInterface;

    export = chromeRemoteInterface;
}

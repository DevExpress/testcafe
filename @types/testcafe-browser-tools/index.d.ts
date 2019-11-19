declare module 'testcafe-browser-tools/lib/errors' {
    export class UnableToAccessScreenRecordingAPIError extends Error {

    }
}

declare module 'testcafe-browser-tools' {
    export function close(windowDescriptor: string | any): Promise<void>;
    export function findWindow(pageTitle: string): any;
    export function generateThumbnail(sourcePath: string, thumbnailPath: string, width: number, height: number): Promise<void>;
    export function isMaximized(windowDescriptor?: string | any): Promise<boolean>;
    export function resize(windowDescriptor: string | any, currentWidth: number, currentHeight: number, width: number, height: number): Promise<void>;
    export function maximize(windowDescriptor: string | any): Promise<void>;
    export function screenshot(windowDescriptor: string | any, screenshotPath: string): Promise<void>;

    import * as errors from 'testcafe-browser-tools/lib/errors';

    export { errors };
}

declare module 'read-file-relative' {
    export function readSync(relativePath: string, binary?: boolean): Buffer | string;
    export function read(relativePath: string, options:{ [key: string]: any }, callback?: Function): void;
}

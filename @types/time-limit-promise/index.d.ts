declare module 'time-limit-promise' {
    export default function (promise: Promise<any>, timeout: number, options?: { resolveWith: any } | { rejectWith: any }): Promise<any>;
}

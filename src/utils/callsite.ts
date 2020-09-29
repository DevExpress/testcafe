/**
* Gets the callsite stackFrame string representation: 'filename:lineNum:colNum'
*/
export function getCallsiteStackFrameString (callsite: any): string {
    return callsite.stackFrames[callsite.callsiteFrameIdx].toString();
}

/**
* Gets the callsite filename and lineNum in the following format: 'filename:lineNum'
*/
export function getCallsiteId (callsite: any): string {
    return `${callsite.filename}:${callsite.lineNum}`;
}

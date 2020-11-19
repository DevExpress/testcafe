const FLOW_MARKER_RE = /^\s*\/\/\s*@flow\s*\n|^\s*\/\*\s*@flow\s*\*\//;

export default function (code: string): boolean {
    return FLOW_MARKER_RE.test(code);
}

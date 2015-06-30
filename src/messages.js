export const MESSAGES = {
    browserDisconnected: 'The {userAgent} browser disconnected. This problem may appear when a browser hangs or is closed, or due to network issues.',
    unableToRunBrowser:  'Unable to run the browser. The file at {path} does not exist or is not executable.'
};

export function getText (template, ...args) {
    return args.reduce((msg, arg) => msg.replace(/{.+?}/, arg), template);
}

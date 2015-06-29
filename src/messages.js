export const MESSAGES = {
    browserConnectionInterrupted: 'The {userAgent} browser did not respond to the TestCafe and was deleted. ' +
                                  'This problem may appear when a browser hangs or is closed, or due to network issues.'
};

export function getText (template, ...args) {
    return args.reduce((msg, arg) => msg.replace(/{.+?}/, arg), template);
}

import hammerhead from '../deps/hammerhead';

const browserUtils = hammerhead.utils.browser;


export default function keyIdentifierRequiredForEvent () {
    return browserUtils.isSafari || browserUtils.isChrome && browserUtils.version < 54;
}

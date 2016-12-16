import hammerhead from '../deps/hammerhead';

const browserUtils = hammerhead.utils.browser;

/* eslint-disable no-undef */
export default IsKeyIdentifierNeeded = () => browserUtils.isSafari || browserUtils.isChrome && browserUtils.version < 54;
/* eslint-enable no-undef */

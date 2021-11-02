// @ts-ignore
import { nativeMethods, utils } from '../../../deps/hammerhead';
import * as dom from '../../dom';
import * as position from '../../position';
import * as style from '../../style';
import { CoreUtilsAdapter } from '../types';

const browser = utils.browser;

const initializer: CoreUtilsAdapter = { nativeMethods, browser, dom, position, style };

export default initializer;

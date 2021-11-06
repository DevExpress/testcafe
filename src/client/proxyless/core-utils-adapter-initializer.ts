import nativeMethods from './native-methods';
import * as dom from './utils/dom';
import * as position from './utils/position';
import * as style from './utils/style';
import { CoreUtilsAdapter } from '../core/utils/shared/types';


const initializer: CoreUtilsAdapter = { nativeMethods, position, dom, style, browser: { isChrome: true }, sendRequestToFrame: null };

export default initializer;

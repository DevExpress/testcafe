import nativeMethods from './native-methods';
import * as domUtils from './utils/dom';
import { getElementRectangle } from './utils/position';
import * as styleUtils from './utils/style';
import { CoreUtilsAdapter } from '../core/utils/types';


const initializer: CoreUtilsAdapter = {
    nativeMethods,

    getElementRectangle: getElementRectangle,

    isTextNode:               domUtils.isTextNode,
    isMapElement:             domUtils.isMapElement,
    isSVGElement:             domUtils.isSVGElement,
    isContentEditableElement: domUtils.isContentEditableElement,
    closest:                  domUtils.closest,
    getMapContainer:          domUtils.getMapContainer,
    getSelectParent:          domUtils.getSelectParent,
    getChildVisibleIndex:     domUtils.getChildVisibleIndex,
    findParent:               domUtils.findParent,
    isElementNode:            domUtils.isElementNode,
    isRenderedNode:           domUtils.isRenderedNode,

    getStyle:             styleUtils.get,
    isSelectVisibleChild: styleUtils.isSelectVisibleChild,
    getScrollTop:         styleUtils.getScrollTop,
    getOptionHeight:      styleUtils.getOptionHeight,
    getSelectElementSize: styleUtils.getSelectElementSize,
};

export default initializer;

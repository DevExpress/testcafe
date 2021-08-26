// @ts-ignore
import { nativeMethods } from '../../deps/hammerhead';
import * as domUtils from '../dom';
import { getElementRectangle } from '../position';
import { CoreUtilsAdapter } from '../types';
import * as styleUtils from '../style';


const initializer: CoreUtilsAdapter = {
    nativeMethods:            nativeMethods,
    isTextNode:               domUtils.isTextNode,
    isMapElement:             domUtils.isMapElement,
    isSVGElement:             domUtils.isSVGElement,
    isContentEditableElement: domUtils.isContentEditableElement,
    closest:                  domUtils.closest,
    getMapContainer:          domUtils.getMapContainer,
    getSelectParent:          domUtils.getSelectParent,
    getChildVisibleIndex:     domUtils.getChildVisibleIndex,
    getElementRectangle:      getElementRectangle,
    findParent:               domUtils.findParent,
    isElementNode:            domUtils.isElementNode,
    getStyle:                 styleUtils.get,
    isRenderedNode:           domUtils.isRenderedNode,
    isSelectVisibleChild:     styleUtils.isSelectVisibleChild,
    getScrollTop:             styleUtils.getScrollTop,
    getOptionHeight:          styleUtils.getOptionHeight,
    getSelectElementSize:     styleUtils.getSelectElementSize,
};

export default initializer;

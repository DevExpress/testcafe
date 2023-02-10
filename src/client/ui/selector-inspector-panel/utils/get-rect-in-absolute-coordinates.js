export function getRectInAbsoluteCoordinates (element) {
    const rect       = element.getBoundingClientRect();
    const scrollTop  = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

    return {
        top:    rect.top + scrollTop,
        left:   rect.left + scrollLeft,
        height: rect.height,
        width:  rect.width,
        bottom: rect.bottom + scrollTop,
        right:  rect.right + scrollLeft,
    };
}

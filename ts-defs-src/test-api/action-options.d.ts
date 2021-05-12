
interface KeyModifiers {
    ctrl?: boolean;
    alt?: boolean;
    shift?: boolean;
    meta?: boolean;
}

interface CropOptions {
    /**
     * The top edge of the cropping rectangle. The coordinate is calculated from the element's top edge.
     * If a negative number is passed, the coordinate is calculated from the element's bottom edge.
     */
    left?: number;
    /**
     * The left edge of the cropping rectangle. The coordinate is calculated from the element's left edge.
     * If a negative number is passed, the coordinate is calculated from the element's right edge.
     */
    right?: number;
    /**
     * The bottom edge of the cropping rectangle. The coordinate is calculated from the element's top edge.
     * If a negative number is passed, the coordinate is calculated from the element's bottom edge.
     */
    top?: number;
    /**
     * The right edge of the cropping rectangle. The coordinate is calculated from the element's left edge.
     * If a negative number is passed, the coordinate is calculated from the element's right edge.
     */
    bottom?: number;
}

interface ActionOptions {
    /**
     * The speed of action emulation. Defines how fast TestCafe performs the action when running tests.
     * A value between 1 (the maximum speed) and 0.01 (the minimum speed). If test speed is also specified in the CLI or
     * programmatically, the action speed setting overrides test speed. Default is 1.
     */
    speed?: number;
}

interface TakeScreenshotOptions {
    /**
     * Specifies the path where the screenshots are saved.
     */
    path?: string;
    /**
     * Specifies that TestCafe should take full-page screenshots.
     */
    fullPage?: boolean;
}

interface TakeElementScreenshotOptions extends ActionOptions {
    /**
     * Allows to crop the target element on the screenshot.
     */
    crop?: CropOptions;
    /**
     * Controls if element's margins should be included in the screenshot.
     * Set this property to `true` to include target element's margins in the screenshot.
     * When it is enabled, the `scrollTargetX`, `scrollTargetY` and `crop` rectangle coordinates are calculated from
     * the corners where top and left (or bottom and right) margins intersect
     */
    includeMargins?: boolean;
    /**
     * Controls if element's borders should be included in the screenshot.
     * Set this property to `true` to include target element's borders in the screenshot.
     * When it is enabled, the `scrollTargetX`, `scrollTargetY` and `crop` rectangle coordinates are calculated from
     * the corners where top and left (or bottom and right) internal edges of the element  intersect
     */
    includeBorders?: boolean;
    /**
     * Controls if element's paddings should be included in the screenshot.
     * Set this property to `true` to include target element's paddings in the screenshot.
     * When it is enabled, the `scrollTargetX`, `scrollTargetY` and `crop` rectangle coordinates are calculated from
     * the corners where top and left (or bottom and right) edges of the element's content area intersect
     */
    includePaddings?: boolean;
    /**
     * Specifies the X coordinate of the scrolling target point.
     * If the target element is too big to fit into the browser window, the page will be scrolled to put this point
     * to the center of the viewport. The coordinates of this point are calculated relative to the target element.
     * If the numbers are positive, the point is positioned relative to the top-left corner of the element.
     * If the numbers are negative, the point is positioned relative to the bottom-right corner.
     * If the target element fits into the browser window, these properties have no effect.
     */
    scrollTargetX?: number;
    /**
     * Specifies the Y coordinate of the scrolling target point.
     * If the target element is too big to fit into the browser window, the page will be scrolled to put this point
     * to the center of the viewport. The coordinates of this point are calculated relative to the target element.
     * If the numbers are positive, the point is positioned relative to the top-left corner of the element.
     * If the numbers are negative, the point is positioned relative to the bottom-right corner.
     * If the target element fits into the browser window, these properties have no effect.
     */
    scrollTargetY?: number;
}

interface OffsetOptions extends ActionOptions {
    /**
     * Mouse pointer X coordinate that define a point where the action is performed or started.
     * If an offset is a positive integer, coordinates are calculated relative to the top-left corner of the target element.
     * If an offset is a negative integer, they are calculated relative to the bottom-right corner.
     * The default is the center of the target element.
     */
    offsetX?: number;
    /**
     * Mouse pointer Y coordinate that define a point where the action is performed or started.
     * If an offset is a positive integer, coordinates are calculated relative to the top-left corner of the target element.
     * If an offset is a negative integer, they are calculated relative to the bottom-right corner.
     * The default is the center of the target element.
     */
    offsetY?: number;
}

interface MouseActionOptions extends OffsetOptions {

    /**
     * Indicate which modifier keys are to be pressed during the mouse action.
     */
    modifiers?: KeyModifiers;
}

interface ClickActionOptions extends MouseActionOptions {
    /**
     * The initial caret position if the action is performed on a text input field. A zero-based integer.
     * The default is the length of the input field content.
     */
    caretPos?: number;
}

interface TypeActionOptions extends ClickActionOptions {
    /**
     * `true` to remove the current text in the target element, and false to leave the text as it is.
     */
    replace?: boolean;
    /**
     * `true` to insert the entire block of current text in a single keystroke (similar to a copy & paste function),
     * and false to insert the current text character by character.
     */
    paste?: boolean;
    /**
     * `true` to replace the typed text with a placeholder when sending action logs to a reporter.
     */
    confidential?: boolean;
}

interface PressActionOptions extends ActionOptions {
    /**
     * `true` to replace the pressed keys with a placeholder when sending action logs to a reporter.
     */
    confidential?: boolean;
}

interface DragToElementOptions extends MouseActionOptions {
    /**
     * Mouse pointer X coordinate that defines a point where the dragToElement action is finished.
     * If an offset is a positive integer, coordinates are calculated relative to the top-left corner of the destination element.
     * If an offset is a negative integer, they are calculated relative to the bottom-right corner.
     * By default, the dragToElement action is finished in the center of the destination element.
     */
    destinationOffsetX?: number;
    /**
     * Mouse pointer Y coordinate that defines a point where the dragToElement action is finished.
     * If an offset is a positive integer, coordinates are calculated relative to the top-left corner of the destination element.
     * If an offset is a negative integer, they are calculated relative to the bottom-right corner.
     * By default, the dragToElement action is finished in the center of the destination element.
     */
    destinationOffsetY?: number;
}

interface ResizeToFitDeviceOptions {
    /**
     * `true` for portrait screen orientation; `false` for landscape.
     */
    portraitOrientation?: boolean;
}

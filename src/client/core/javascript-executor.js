//TODO: move it to the recorder
import * as hammerheadAPI from './deps/hammerhead';
import $ from './deps/jquery';
import * as domUtils from './util/dom';
import * as positionUtils from './util/position';
import * as serviceUtils from './util/service';
import * as customSelectors from './jquery-extensions/custom-selectors';
import * as sandboxedJQuery from './sandboxed-jquery';


var nativeMethods  = hammerheadAPI.NativeMethods;
var shadowUI       = hammerheadAPI.ShadowUI;
var messageSandbox = hammerheadAPI.MessageSandbox;
var jsProcessor    = hammerheadAPI.JSProcessor;


const SAFE_EXECUTOR_DIV_CLASS    = 'safeExecutor';
const SAFE_EXECUTOR_IFRAME_CLASS = 'safeExecutorIFrame';


var $safeExecutorDiv                  = null,
    safeExecutorIFrame                = null,
    safeExecutorDocumentBodyOverrided = null;

//Errors
export const EMPTY_SELECTOR_ERROR                    = 'Empty element selector';
export const INVALID_ELEMENTS_IN_JQUERY_OBJECT_ERROR = 'jQuery object contains invalid elements';
export const INVALID_ELEMENTS_IN_ARRAY_ERROR         = 'Array contains invalid elements';
export const INVALID_OBJECT_ERROR                    = 'Invalid object type';
export const RECURSIVE_JQUERY_CALLING_ERROR          = 'Maximum call stack size exceeded';
export const SELECTOR_DOES_NOT_CONTAIN_ELEMENT_ERROR = 'Selector doesn\'t contain any element';
export const JAVASCRIPT_ERROR_PREFIX                 = 'Javascript error: ';

var isInIFrameWindow = window.top !== window.self;

var getSafeExecutorDiv = function () {
    if (!$safeExecutorDiv || !isElementInDom($safeExecutorDiv)) {
        $safeExecutorDiv = $(shadowUI.getRoot()).find(' > div[class]').filter(function () {
            return $(this).attr('class').indexOf(SAFE_EXECUTOR_DIV_CLASS) === 0;
        });
        if (!$safeExecutorDiv.length) {
            $safeExecutorDiv = $(nativeMethods.createElement.call(document, 'div'));
            nativeMethods.appendChild.call(shadowUI.getRoot(), $safeExecutorDiv[0]);
            shadowUI.addClass($safeExecutorDiv[0], SAFE_EXECUTOR_DIV_CLASS);
        }
    }
    return $safeExecutorDiv;
};

var getSafeExecutorIFrame = function () {
    if (!safeExecutorIFrame || !isElementInDom($(safeExecutorIFrame)))
        initSafeExecutorIFrame();
    return safeExecutorIFrame;
};

var initSafeExecutorIFrame = function () {
    createSafeExecutorIFrame();
    overrideSafeExecutorIFrameProperties();
};

var createSafeExecutorIFrame = function () {
    var $safeExecutorIFrame = getSafeExecutorDiv().find('iframe');
    if (!$safeExecutorIFrame.length) {
        $safeExecutorIFrame = $(nativeMethods.createElement.call(document, 'iframe'));
        $safeExecutorIFrame.css('display', 'none');
        nativeMethods.appendChild.call(getSafeExecutorDiv()[0], $safeExecutorIFrame[0]);
        shadowUI.addClass($safeExecutorIFrame[0], SAFE_EXECUTOR_IFRAME_CLASS);
    }
    safeExecutorIFrame = $safeExecutorIFrame.get(0);
    $safeExecutorIFrame.load(overrideSafeExecutorIFrameProperties);
};

var overrideSafeExecutorIFrameProperties = function () {
    if (!safeExecutorIFrame || !isElementInDom($(safeExecutorIFrame)))
        createSafeExecutorIFrame();

    //NOTE: we override safeExecutorIFrame.contentWindow.document.body property to allow parsing strings like 'document.body.childNodes[0]'
    // or '$('div:first', document.body)' . Safari throws exception on this, so we use another approach in it (change input string during parsing)
    try {
        if (Object.getOwnPropertyDescriptor &&
            Object.getOwnPropertyDescriptor(safeExecutorIFrame.contentWindow.document, 'body') &&
            Object.getOwnPropertyDescriptor(safeExecutorIFrame.contentWindow.document, 'body').configurable) {
            Object.defineProperty(safeExecutorIFrame.contentWindow.document, 'body', {
                get:          function () {
                    return window.document.body;
                },
                configurable: true
            });
            safeExecutorDocumentBodyOverrided = true;
        }
        else safeExecutorDocumentBodyOverrided = false;
    }
    catch (e) {
        safeExecutorDocumentBodyOverrided = false;
    }

    var jQuery = customSelectors.create(sandboxedJQuery.jQuery);
    customSelectors.init();

    safeExecutorIFrame.contentWindow.$ = safeExecutorIFrame.contentWindow.jQuery = function (selector, context) {
        if (selector === arguments.callee || context === arguments.callee)
            throw new Error(RECURSIVE_JQUERY_CALLING_ERROR);
        else
            return jQuery(selector, context);
    };
    safeExecutorIFrame.contentWindow.alert = safeExecutorIFrame.contentWindow.confirm = safeExecutorIFrame.contentWindow.prompt = new Function();

    safeExecutorIFrame.contentWindow[jsProcessor.CALL_METHOD_METH_NAME]    = window[jsProcessor.CALL_METHOD_METH_NAME];
    safeExecutorIFrame.contentWindow[jsProcessor.GET_LOCATION_METH_NAME]   = window[jsProcessor.GET_LOCATION_METH_NAME];
    safeExecutorIFrame.contentWindow[jsProcessor.GET_PROPERTY_METH_NAME]   = window[jsProcessor.GET_PROPERTY_METH_NAME];
    safeExecutorIFrame.contentWindow[jsProcessor.PROCESS_SCRIPT_METH_NAME] = window[jsProcessor.PROCESS_SCRIPT_METH_NAME];
    safeExecutorIFrame.contentWindow[jsProcessor.SET_LOCATION_METH_NAME]   = new Function();
    safeExecutorIFrame.contentWindow[jsProcessor.SET_PROPERTY_METH_NAME]   = new Function();
};

var isElementInDom = function ($el) {
    return !!$el.parents('body').length;
};

var convertToJQueryObject = function (obj) {
    var $result = null,
        error   = null;

    var createResultObject = function () {
        return {
            result: $result,
            error:  error
        };
    };

    if (serviceUtils.isJQueryObj(obj)) {
        if (isDomElementsCollection(obj))
            $result = obj;
        else
            error = INVALID_ELEMENTS_IN_JQUERY_OBJECT_ERROR;
        return createResultObject();
    }

    if (typeof obj === 'string' || domUtils.isDomElement(obj) || obj instanceof NodeList ||
        obj instanceof HTMLCollection) {
        try {
            var res = $(obj);
            if (serviceUtils.isJQueryObj(res))
                $result = res;
            return createResultObject();
        }
        catch (err) {
            error = JAVASCRIPT_ERROR_PREFIX + err;
            return createResultObject();
        }
    }

    if ($.isArray(obj)) {
        $result = $();
        for (var i = 0; i < obj.length; i++) {
            var converted = convertToJQueryObject(obj[i]);
            if (converted.error) {
                error = converted.error;
                return createResultObject();
            }
            else if (!converted.result) {
                error = INVALID_ELEMENTS_IN_ARRAY_ERROR;
                return createResultObject();
            }
            $result = $result.add(converted.result);
        }
        return createResultObject();
    }

    if (typeof obj === 'function') {
        $result = evalE(obj + '()', function (err) {
            error = JAVASCRIPT_ERROR_PREFIX + err;
        });
        if (error)
            return createResultObject();
        return convertToJQueryObject($result);
    }

    return createResultObject();
};

function isDomElementsCollection (obj) {
    if (obj instanceof NodeList || obj instanceof HTMLCollection || $.isArray(obj) || serviceUtils.isJQueryObj(obj)) {
        for (var i = 0; i < obj.length; i++)
            if (!domUtils.isDomElement(obj[i]))
                return false;
        return true;
    }
    else
        return false;
}

function evalExpression (expression) {
    var scriptToEval = [];

    scriptToEval.push('(function (window, document, jQuery, $) {');
    scriptToEval.push('var savedAlert = window.alert;window.alert = new Function();');
    scriptToEval.push('var savedConfirm = window.confirm;window.confirm = new Function();');
    scriptToEval.push('var savedPrompt = window.prompt;window.prompt = new Function();');
    scriptToEval.push('var savedConsoleLog = null; if(window.console) {savedConsoleLog = window.console.log;window.console.log = new Function();}');
    scriptToEval.push('var saved$ = window.$, savedJQuery = window.jQuery; window.$ = $; window.jQuery = $;');
    scriptToEval.push('var err = null;');
    scriptToEval.push('try { var res = (function () { return ' + jsProcessor.process(expression) +
                      '})(); } catch (e) {err = e;}');
    scriptToEval.push('window.alert = savedAlert;');
    scriptToEval.push('window.confirm = savedConfirm;');
    scriptToEval.push('window.prompt = savedPrompt;');
    scriptToEval.push('if(savedConsoleLog){window.console.log = savedConsoleLog;}');
    scriptToEval.push('window.$ = saved$; window.jQuery = savedJQuery;');
    scriptToEval.push('if(err)throw err;');
    scriptToEval.push('return res;');
    scriptToEval.push('})(window.parent, window.parent.document, window.$, window.$)');

    return getSafeExecutorIFrame().contentWindow.eval(scriptToEval.join(''));
}

export function evalE (expression, errorCallback) {
    try {
        if (!safeExecutorDocumentBodyOverrided)
            expression = expression.replace(/(^|[^a-z0-9_\$])document.body($|[^a-z0-9_\$])/g, function (substr, charBefore, charAfter) {
                return charBefore + (isInIFrameWindow ? 'window.document.body' : 'window.top.document.body') +
                       charAfter;
            });

        return evalExpression(expression);
    }
    catch (err) {
        errorCallback(err);
    }
}

export function parseSelector (selector, parseDomElementsOrJqueryObjectsOnly, callback, context) {
    if (!context || !(window.top === window.self && context.top !== context.self)) {
        callback(parseSelectorSync(selector, parseDomElementsOrJqueryObjectsOnly));
        return;
    }

    currentParseCallback = callback;

    var msg = {
        cmd:                                 IFRAME_PARSE_SELECTOR_REQUEST_MSG_CMD,
        selector:                            selector,
        parseDomElementsOrJqueryObjectsOnly: parseDomElementsOrJqueryObjectsOnly
    };

    messageSandbox.sendServiceMsg(msg, context);
}

export function parseSelectorSync (selector, parseDomElementsOrJqueryObjectsOnly) {
    var evalResults      = null,
        $elements        = null,
        $visibleElements = null,
        errorMessage     = '';

    function isCombinationOfSelectAndChild () {
        return $elements.length === 2 && domUtils.isSelectElement($elements[0]) &&
               /option|optgroup/.test($elements[1].tagName.toLowerCase()) &&
               $elements.eq(0).has($elements.last()).length;
    }

    if (!selector.length)
        return {
            $elements:        null,
            length:           0,
            $visibleElements: null,
            visibleLength:    0,
            iframeContext:    false,
            error:            EMPTY_SELECTOR_ERROR,
            selector:         selector
        };

    evalResults = evalE(selector, function (err) {
        errorMessage = JAVASCRIPT_ERROR_PREFIX + err.message;
    });

    if (!errorMessage) {
        if (serviceUtils.isJQueryObj(evalResults)) {
            if (isDomElementsCollection(evalResults))
                $elements = evalResults;
            else
                errorMessage = INVALID_ELEMENTS_IN_JQUERY_OBJECT_ERROR;
        }
        else if (parseDomElementsOrJqueryObjectsOnly) {
            if (domUtils.isDomElement(evalResults) || isDomElementsCollection(evalResults))
                $elements = $(evalResults);
            else {
                errorMessage = SELECTOR_DOES_NOT_CONTAIN_ELEMENT_ERROR;
            }
        }
        else {
            var converted = convertToJQueryObject(evalResults);
            if (converted.error) {
                errorMessage = converted.error;
            }
            else if (!converted.result)
                errorMessage = INVALID_OBJECT_ERROR;
            else
                $elements = converted.result;
        }
    }

    //NOTE: we combine clicks on select and option tags to the one action
    var combineSelectAndOption = false;

    if ($elements && !errorMessage) {
        combineSelectAndOption = isCombinationOfSelectAndChild();

        $visibleElements = combineSelectAndOption ? $elements :
                           $elements.filter(function (index) {
                               return positionUtils.isElementVisible($elements[index]);
                           });
    }

    return {
        $elements:        $elements,
        length:           combineSelectAndOption ? 1 : ($elements ? $elements.length : 0),
        $visibleElements: $visibleElements,
        visibleLength:    combineSelectAndOption ? 1 : ($visibleElements ? $visibleElements.length : 0),
        iframeContext:    false,
        error:            errorMessage,
        selector:         selector,
        evalResults:      evalResults
    };
}

export function init () {
    //B238559 - iframe creating breaks text selection so we create safe executor iframe after recording starts
    initSafeExecutorIFrame();
}

//Cross-domain
var IFRAME_PARSE_SELECTOR_REQUEST_MSG_CMD  = 'parseSelectorRequest',
    IFRAME_PARSE_SELECTOR_RESPONSE_MSG_CMD = 'parseSelectorResponse';

var currentParseCallback = null;

messageSandbox.on(messageSandbox.SERVICE_MSG_RECEIVED, function (e) {
    var msg = e.message;

    switch (msg.cmd) {
        case IFRAME_PARSE_SELECTOR_REQUEST_MSG_CMD:
            var res = parseSelectorSync(msg.selector, msg.parseDomElementsOrJqueryObjectsOnly);

            res.length        = res.$elements ? res.$elements.length : 0;
            res.iframeContext = true;

            //NOTE: prepare to JSON serialization
            delete res.$elements;
            delete res.$visibleElements;
            delete res.evalResults;

            var responseMsg = {
                cmd:            IFRAME_PARSE_SELECTOR_RESPONSE_MSG_CMD,
                parsedSelector: res,
                selector:       msg.selector
            };

            messageSandbox.sendServiceMsg(responseMsg, window.top);

            break;

        case IFRAME_PARSE_SELECTOR_RESPONSE_MSG_CMD:
            if (typeof currentParseCallback === 'function') {
                currentParseCallback(msg.parsedSelector);
                currentParseCallback = null;
            }
            break;
    }
});

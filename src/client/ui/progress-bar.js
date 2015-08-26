import * as hammerheadAPI from './deps/hammerhead';
import testCafeCore from './deps/testcafe-core';

var shadowUI = hammerheadAPI.ShadowUI;
var $        = testCafeCore.$;


const CONTAINER_CLASS = 'progress-bar';
const VALUE_CLASS     = 'value';
const SUCCESS_CLASS   = 'success';


var ProgressBar = function ($container, startValue) {
    this.$container = $('<div></div>').appendTo($container);
    this.$value     = $('<div></div>').appendTo(this.$container);

    shadowUI.addClass(this.$container[0], CONTAINER_CLASS);
    shadowUI.addClass(this.$value[0], VALUE_CLASS);

    this.setValue(startValue);
};

ProgressBar.prototype.setValue = function (value) {
    if (typeof value !== 'number' || value < 0)
        value = 0;
    else if (value > 100)
        value = 100;

    this.$value.css('width', value + '%');
};

ProgressBar.prototype.setSuccess = function (value) {
    if (value)
        shadowUI.addClass(this.$container[0], SUCCESS_CLASS);
    else
        shadowUI.removeClass(this.$container[0], SUCCESS_CLASS);
};

export default ProgressBar;

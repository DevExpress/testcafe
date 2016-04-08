var expect                          = require('chai').expect;
var TYPE                            = require('../../lib/test-run/commands/type');
var createCommand                   = require('../../lib/test-run/commands').createCommandFromObject;
var ClickCommand                    = require('../../lib/test-run/commands').Click;
var TestDoneCommand                 = require('../../lib/test-run/commands').TestDone;
var ClickOptions                    = require('../../lib/test-run/commands/options').ClickOptions;
var ActionSelectorTypeError         = require('../../lib/errors/test-run').ActionSelectorTypeError;
var ActionOptionsTypeError          = require('../../lib/errors/test-run').ActionOptionsTypeError;
var ActionPositiveNumberOptionError = require('../../lib/errors/test-run').ActionPositiveNumberOptionError;

function wrapWithQuerySelectorFunction (str) {
    return '(function () { return document.querySelector(\'' + str + '\') })()';
}

describe('Test run commands', function () {
    describe('Construction from object', function () {
        it('Should create ClickCommand from object', function () {
            var commandObj = {
                type:      TYPE.click,
                arguments: {
                    selector: '',
                    options:  {}
                }
            };

            var command = createCommand(commandObj);

            expect(command instanceof ClickCommand).to.be.true;
            expect(command.type).eql(commandObj.type);
            expect(command.arguments.options).eql(new ClickOptions());
            expect(command.arguments.selector).eql(wrapWithQuerySelectorFunction(commandObj.arguments.selector));
        });

        it('TestDone', function () {
            var commandObj = {
                type: TYPE.testDone
            };

            var command = createCommand(commandObj);

            expect(command instanceof TestDoneCommand).to.be.true;
            expect(command.type).eql(commandObj.type);
        });
    });

    describe('Validation', function () {
        it('Should validate СlickСommand', function () {
            expect(function () {
                return new ClickCommand({
                    arguments: {
                        selector: 1
                    }
                });
            }).to.throw(ActionSelectorTypeError);

            expect(function () {
                return new ClickCommand({
                    arguments: {
                        selector: 'element',
                        options:  1
                    }
                });
            }).to.throw(ActionOptionsTypeError);

            expect(function () {
                return new ClickCommand({
                    arguments: {
                        selector: 'element',
                        options:  {
                            offsetX: 'offsetX'
                        }
                    }
                });
            }).to.throw(ActionPositiveNumberOptionError);
        });
    });
});

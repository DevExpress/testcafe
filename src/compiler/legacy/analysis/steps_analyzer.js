var Ast = require('./../ast'),
    Common = require('./../common'),
    ErrCodes = require('./../err_codes'),
    CallAnalyzer = require('./call_analyzer');

var StepsAnalyzer = module.exports = function (isMixin, rawStepData, errs, sourceIndex) {
    this.rawStepData = rawStepData;
    this.isMixin = isMixin;
    this.errs = errs;
    this.sourceIndex = sourceIndex;
    this.src = null;
    this.filename = null;

    this.ERR = {};
    this.ERR.MISPLACED_DECLARATION = isMixin ? ErrCodes.MISPLACED_MIXIN_DECLARATION : ErrCodes.MISPLACED_TEST_DECLARATION;
    this.ERR.EMPTY_NAME = isMixin ? ErrCodes.EMPTY_MIXIN_NAME : ErrCodes.EMPTY_TEST_NAME;
    this.ERR.DUPLICATE_NAME = isMixin ? ErrCodes.DUPLICATE_MIXIN_NAME : ErrCodes.DUPLICATE_TEST_NAME;
    this.ERR.INVALID_ASSIGNMENT = isMixin ? ErrCodes.INVALID_MIXIN_ASSIGNMENT : ErrCodes.INVALID_TEST_ASSIGNMENT;
    this.ERR.FACILITY_IS_EMPTY = isMixin ? ErrCodes.MIXIN_IS_EMPTY : ErrCodes.TEST_IS_EMPTY;
    this.ERR.MIXIN_USED_IN_MIXIN = ErrCodes.MIXIN_USED_IN_MIXIN;
    this.ERR.INIFRAME_FUNCTION_SHOULD_ACCEPT_TWO_ARGS = ErrCodes.INIFRAME_FUNCTION_SHOULD_ACCEPT_TWO_ARGS;
    this.ERR.STEP_IS_NOT_A_FUNCTION = isMixin ? ErrCodes.MIXIN_STEP_IS_NOT_A_FUNCTION : ErrCodes.TEST_STEP_IS_NOT_A_FUNCTION_OR_MIXIN;
    this.ERR.STEP_IS_EMPTY = isMixin ? ErrCodes.MIXIN_STEP_IS_EMPTY : ErrCodes.TEST_STEP_IS_EMPTY;
};

StepsAnalyzer.prototype.run = function (astPath, filename, src) {
    this.src = src;
    this.filename = filename;

    if (!Ast.isPathMatch(Common.TEST_AND_MIXIN_DECLARATION_AST_PATH, astPath)) {
        this._err(this.ERR.MISPLACED_DECLARATION, astPath);
        return;
    }

    //NOTE: [sub, [WE_ARE_HERE], ['string', NAME]]
    var name = Ast.getAncestorByName('sub', astPath)[2][1];

    if (!name) {
        this._err(this.ERR.EMPTY_NAME, astPath);
        return;
    }

    var isDuplicate = this.rawStepData[name];

    if (isDuplicate) {
        this._err(this.ERR.DUPLICATE_NAME, astPath, {name: name});
        return;
    }

    //NOTE: ['assign', true, ['sub', [WE_ARE_HERE], ...], [TEST_OBJ]]
    var obj = Ast.getAncestorByName('assign', astPath)[3];

    if (Ast.getEntryName(obj) !== 'object') {
        this._err(this.ERR.INVALID_ASSIGNMENT, astPath);
        return;
    }

    var steps = obj[1];

    if (!steps.length)
        this._err(this.ERR.FACILITY_IS_EMPTY, astPath);
    else
        this._analyzeSteps(name, steps);
};


StepsAnalyzer.prototype._tryExtractTestCasesDirectiveAst = function (steps) {
    var firstStep = steps[0];

    if (firstStep[0] === Common.TEST_CASES_DIRECTIVE) {
        steps.splice(0, 1);

        return firstStep[1];
    }

    return null;
};

StepsAnalyzer.prototype._analyzeSteps = function (facilityName, steps) {
    var analyzer = this;

    this.rawStepData[facilityName] = {
        names: [],
        asts: []
    };

    if (!this.isMixin)
        this.rawStepData[facilityName].testCasesDirectiveAst = this._tryExtractTestCasesDirectiveAst(steps);

    steps.forEach(function (step) {
        var stepAst = step[1],
            stepEntryName = Ast.getEntryName(stepAst);

        if (stepEntryName !== 'function') {
            //NOTE: we have mixin insertion point candidate
            if (stepEntryName === 'string' &&
                analyzer._tryAnalyzeAsMixinInsertion(stepEntryName, stepAst, facilityName, step)) {
                return;
            }

            //NOTE: we have inIFrame call candidate
            if (stepEntryName === 'call' && stepAst[1][1] === 'inIFrame')
                analyzer._analyzeAsInIframeCall(stepAst, facilityName, step);

            //NOTE: it's not mixin or inIframe - just fail
            else
                analyzer._err(analyzer.ERR.STEP_IS_NOT_A_FUNCTION, stepAst);

            return;
        }

        analyzer._analyzeStepContent(stepAst);
        analyzer._insertStep(facilityName, step[0], stepAst);
    });
};

StepsAnalyzer.prototype._tryAnalyzeAsMixinInsertion = function (stepEntryName, stepAst, facilityName, step) {
    var match = Common.DIRECTIVE_EXPRESSION_PATTERN.exec(stepAst[1]);

    if (match && match[1] === Common.MIXIN_INSERTION_POINT_DIRECTIVE_LVALUE) {
        if (this.isMixin)
            this._err(this.ERR.MIXIN_USED_IN_MIXIN, stepAst);

        else {
            this._insertStep(facilityName, step[0], {
                isMixinInsertionPoint: true,
                mixinName: match[2],
                line: Ast.getCurrentSrcLineNum(stepAst)
            });
        }

        return true;
    }

    return false;
};

StepsAnalyzer.prototype._analyzeAsInIframeCall = function (stepAst, facilityName, step) {
    if (stepAst[2].length < 2)
        this._err(this.ERR.INIFRAME_FUNCTION_SHOULD_ACCEPT_TWO_ARGS, stepAst);

    else {
        var selectorArgAst = stepAst[2][0],
            stepBodyAst = stepAst[2][1];

        if (Ast.getEntryName(stepBodyAst) !== 'function')
            this._err(this.ERR.STEP_IS_NOT_A_FUNCTION, stepAst);

        else {
            this._analyzeStepContent(stepBodyAst);

            if (selectorArgAst[0].name !== 'function') {
                //NOTE: modify iFrame selector to a function
                stepAst[2][0] = ['function', null, [], [
                    ['return', selectorArgAst]
                ]];
            }

            this._insertStep(facilityName, step[0], stepAst);
        }
    }
};

StepsAnalyzer.prototype._analyzeStepContent = function (stepAst) {
    //NOTE: Mark the last entry in a function body with flag to know
    //that action function is situated at the end of the function body
    var funcBody = stepAst[3],
        funcLastEntr = funcBody[funcBody.length - 1];

    if (!funcLastEntr) {
        this._err(this.ERR.STEP_IS_EMPTY, stepAst);
        return;
    }

    funcLastEntr[0].last = true;

    //NOTE: Traverse step function AST and validate calls of the action and async functions.
    CallAnalyzer.run(stepAst, this.filename, this.errs, false, this.sourceIndex, this.src);
};

StepsAnalyzer.prototype._insertStep = function (facilityName, name, ast) {
    this.rawStepData[facilityName].names.push(name);
    this.rawStepData[facilityName].asts.push(ast);
};

StepsAnalyzer.prototype._err = function (type, currentAst, additionalFields) {
    var line = Ast.getCurrentSrcLineNum(currentAst);
    this.errs.push(Common.createErrorObj(type, this.filename, line, additionalFields));
};


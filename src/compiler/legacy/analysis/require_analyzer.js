var astProcessor  = require('uglify-js').uglify,
    Common        = require('./../common'),
    Hammerhead    = require('testcafe-hammerhead'),
    Ast           = require('./../ast'),
    CallAnalyzer  = require('./call_analyzer'),
    StepsAnalyzer = require('./steps_analyzer');

function extractMixins (ast, descriptor, errs, sourceIndex) {
    var walker             = astProcessor.ast_walker(),
        mixinAnalyzer      = new StepsAnalyzer(true, descriptor.rawMixinsStepData, errs, sourceIndex),
        requireCodeRebuild = false;

    walker.with_walkers({
        'string': function () {
            var astPath      = walker.stack(),
                topStatement = astPath[1][0];

            if (this[1] === Common.MIXIN_DECLARATION_MARKER) {
                topStatement.remove = true;
                requireCodeRebuild  = true;

                mixinAnalyzer.run(walker.stack(), descriptor.filename, descriptor.jsCode);
            }
        }
    }, function () {
        walker.walk(ast);
    });

    return requireCodeRebuild;
}

function analyzeRequireCode (requireAst, descriptor, errs, sourceIndex) {
    //OPTIMIZATION: use footprints to determine if we need deeper analysis
    var originalSrc = descriptor.jsCode;

    if (Common.MIXIN_FOOTPRINT_REGEXP.test(descriptor.jsCode)) {
        var rebuildCode = extractMixins(requireAst, descriptor, errs, sourceIndex);

        //NOTE: we need to rebuild js code if mixins were removed from AST
        if (rebuildCode) {
            requireAst        = Ast.getRemainderAst(requireAst);
            descriptor.jsCode = requireAst ? astProcessor.gen_code(requireAst, { beautify: true }) : '';
        }
    }

    if (Common.ACTION_OR_ASSERTION_FOOTPRINT_REGEXP.test(descriptor.jsCode)) {
        //NOTE: validate what require file doesn't contain action functions calls and update source index
        if (CallAnalyzer.run(requireAst, descriptor.filename, errs, true, sourceIndex, originalSrc)) {
            //NOTE: if call analyzer found assertions and added them to index, we need to rebuild again
            descriptor.jsCode = requireAst ? astProcessor.gen_code(requireAst, { beautify: true }) : '';
        }
    }
}

exports.run = function (requireFilename, ownerFilename, sourceIndex, callback) {
    var errs       = [],
        descriptor = {
            hasErrs:           false,
            jsCode:            null,
            rawMixinsStepData: {},
            filename:          requireFilename
        };

    Ast.construct(requireFilename, ownerFilename, function (parsingErr, requireAst, srcCode) {
        if (parsingErr)
            errs.push(parsingErr);

        else if (requireAst) {
            descriptor.jsCode = srcCode;
            analyzeRequireCode(requireAst, descriptor, errs, sourceIndex);
        }

        if (!errs.length)
            descriptor.jsCode = Hammerhead.wrapDomAccessors(descriptor.jsCode, true);

        //NOTE: User can forget ';' at the end of the require js file. In this case, an js exception may occure after
        //requires merging. So we add ';' at the end of the require code manually
        if (descriptor.jsCode && descriptor.jsCode[descriptor.jsCode.length - 1] !== ';')
            descriptor.jsCode += ';';

        descriptor.hasErrs = !!errs.length;

        callback(errs, descriptor);
    });
};

(function () {
    var JSProcessor = {};

    var isNode = typeof module !== 'undefined' && module.exports;

    var JSParsingTools = isNode ? require('./js_parsing_tools') : HammerheadClient.get('Shared.JSParsingTools');

    // Const
    JSProcessor.GET_LOCATION_METH_NAME = '__get$Loc';
    JSProcessor.SET_LOCATION_METH_NAME = '__set$Loc';
    JSProcessor.SET_PROPERTY_METH_NAME = '__set$';
    JSProcessor.GET_PROPERTY_METH_NAME = '__get$';
    JSProcessor.CALL_METHOD_METH_NAME = '__call$';
    JSProcessor.PROCESS_SCRIPT_METH_NAME = '__proc$Script';

    JSProcessor.FOR_IN_TEMP_VAR_NAME = '__set$temp';
    JSProcessor.DOCUMENT_WRITE_BEGIN_PARAM = '__begin$';
    JSProcessor.DOCUMENT_WRITE_END_PARAM = '__end$';

    var HTML_COMMENT_REG_EXP = /(^|\n)\s*<!--[.\r]*(\n|$)/g;

    JSProcessor.MOCK_ACCESSORS = [
        'var __w$undef_ = typeof window === "undefined",\r\n',
        JSProcessor.GET_LOCATION_METH_NAME, '=__w$undef_?function(l){return l}:window.', JSProcessor.GET_LOCATION_METH_NAME, ',\r\n',
        JSProcessor.SET_LOCATION_METH_NAME, '=__w$undef_?function(l,v){return l = v}:window.', JSProcessor.SET_LOCATION_METH_NAME, ',\r\n',
        JSProcessor.SET_PROPERTY_METH_NAME, '=__w$undef_?function(o,p,v){return o[p] = v}:window.', JSProcessor.SET_PROPERTY_METH_NAME, ',\r\n',
        JSProcessor.GET_PROPERTY_METH_NAME, '=__w$undef_?function(o,p){return o[p]}:window.', JSProcessor.GET_PROPERTY_METH_NAME, ',\r\n',
        JSProcessor.CALL_METHOD_METH_NAME, '=__w$undef_?function(o,p,a){return o[p].apply(o,a)}:window.', JSProcessor.CALL_METHOD_METH_NAME, ',\r\n',
        JSProcessor.PROCESS_SCRIPT_METH_NAME, '=__w$undef_?function(s){return s}:window.', JSProcessor.PROCESS_SCRIPT_METH_NAME, ';\r\n'
    ].join('');

    var SYNTAX = {
        AssignmentExpression: 'AssignmentExpression',
        ArrayExpression: 'ArrayExpression',
        BlockStatement: 'BlockStatement',
        BinaryExpression: 'BinaryExpression',
        BreakStatement: 'BreakStatement',
        CallExpression: 'CallExpression',
        CatchClause: 'CatchClause',
        ConditionalExpression: 'ConditionalExpression',
        ContinueStatement: 'ContinueStatement',
        DoWhileStatement: 'DoWhileStatement',
        DebuggerStatement: 'DebuggerStatement',
        EmptyStatement: 'EmptyStatement',
        ExpressionStatement: 'ExpressionStatement',
        ForStatement: 'ForStatement',
        ForInStatement: 'ForInStatement',
        FunctionDeclaration: 'FunctionDeclaration',
        FunctionExpression: 'FunctionExpression',
        Identifier: 'Identifier',
        IfStatement: 'IfStatement',
        Literal: 'Literal',
        LabeledStatement: 'LabeledStatement',
        LogicalExpression: 'LogicalExpression',
        MemberExpression: 'MemberExpression',
        NewExpression: 'NewExpression',
        ObjectExpression: 'ObjectExpression',
        Program: 'Program',
        Property: 'Property',
        ReturnStatement: 'ReturnStatement',
        SequenceExpression: 'SequenceExpression',
        SwitchStatement: 'SwitchStatement',
        SwitchCase: 'SwitchCase',
        ThisExpression: 'ThisExpression',
        ThrowStatement: 'ThrowStatement',
        TryStatement: 'TryStatement',
        UnaryExpression: 'UnaryExpression',
        UpdateExpression: 'UpdateExpression',
        VariableDeclaration: 'VariableDeclaration',
        VariableDeclarator: 'VariableDeclarator',
        WhileStatement: 'WhileStatement',
        WithStatement: 'WithStatement'
    };

    var codegenOpts = {
        format: {
            quotes: 'double',
            escapeless: true
        }
    };

    JSProcessor.isJSON = function (code) {
        if (JSProcessor.isObject(code)) {
            try {
                JSON.parse(code);

                return true;
            } catch (e) {
            }
        }

        return false;
    };

    JSProcessor.isArray = function (code) {
        return /^\s*\[[\s\S]*\]\s*$/.test(code);
    };

    JSProcessor.isObject = function (code) {
        return /^\s*\{[\s\S]*\}\s*$/.test(code);
    };

    JSProcessor.isScriptProcessed = function (code) {
        return new RegExp([
            JSProcessor.GET_LOCATION_METH_NAME,
            JSProcessor.SET_LOCATION_METH_NAME,
            JSProcessor.SET_PROPERTY_METH_NAME,
            JSProcessor.GET_PROPERTY_METH_NAME,
            JSProcessor.CALL_METHOD_METH_NAME,
            JSProcessor.PROCESS_SCRIPT_METH_NAME
        ].join('|').replace(/\$/, '\\$')).test(code);
    };

    JSProcessor.wrappedMethods = {
        postMessage: true,
        write: true,
        writeln: true
    };

    JSProcessor.wrappedProperties = {
        action: true,
        activeElement: true,
        attributes: true,
        autocomplete: true,
        background: true,
        backgroundImage: true,
        borderImage: true,
        cookie: true,
        cssText: true,
        cursor: true,
        data: true,
        domain: true,
        files: true,
        firstChild: true,
        firstElementChild: true,
        host: true,
        hostname: true,
        href: true,
        innerHTML: true,
        lastChild: true,
        lastElementChild: true,
        length: true,
        listStyle: true,
        listStyleImage: true,
        location: true,
        manifest: true,
        onbeforeunload: true,
        onerror: true,
        onmessage: true,
        origin: true,
        pathname: true,
        port: true,
        protocol: true,
        referrer: true,
        sandbox: true,
        search: true,
        src: true,
        target: true,
        text: true,
        textContent: true,
        URL: true,
        value: true,
        which: true
    };

    function htmlCommentsReplacer(code) {
        code = code.replace(HTML_COMMENT_REG_EXP, '\n');

        if (HTML_COMMENT_REG_EXP.test(code))
            code = htmlCommentsReplacer(code);

        return code;
    }

    function needToWrapProperty(property) {
        return JSProcessor.wrappedProperties[property] && JSProcessor.wrappedProperties.hasOwnProperty(property);
    }

    function needToWrapMethod(meth) {
        return JSProcessor.wrappedMethods[meth] && JSProcessor.wrappedMethods.hasOwnProperty(meth);
    }

    JSProcessor.isDataScript = function (code) {
        return JSProcessor.isObject(code) || JSProcessor.isArray(code);
    };

    JSProcessor.process = function (code, beautify) {
        var isJSON = JSProcessor.isJSON(code),
            isObject = JSProcessor.isObject(code);

        codegenOpts.json = isJSON;

        // T226589. Js parser removes next line after '<!--'
        var result = htmlCommentsReplacer(code),
            ast = null;

        try {
            ast = JSParsingTools.parse((isObject && !isJSON) ? '(' + result + ')' : 'function temp(){\n' + result + '\n}');
        } catch (e) {
            try {
                if (isObject && !isJSON) {
                    ast = JSParsingTools.parse('function temp(){\n' + result + '\n}');
                    isObject = false;
                } else
                    return code;
            } catch (err) {
                return code;
            }
        }

        var modified = modify(ast);

        if (!modified)
            return code;

        codegenOpts.format.compact = !beautify;

        result = JSParsingTools.generate(ast, codegenOpts);

        if (isObject && !isJSON)
            result = result.replace(/^\(|\);\s*$/g, '');
        else
            result = result.replace(/^\s*function\s+temp\s*\(\s*\)\s*{\s*/, '').replace(/\s*}\s*$/, '');

        if (!/;\s*$/.test(code))
            result = result.replace(/;\s*$/, '');

        return result;
    };

    // Modify conditions
    var modifiers = [
        {
            modifier: documentWrite,
            condition: function (astNode) {
                // { ... [obj].write([html]); ... [obj].writeln([html]); ... }
                if (astNode.type === SYNTAX.BlockStatement || astNode.type === SYNTAX.Program)
                    return getDocumentWriteStatementIndices(astNode.body).length > 1;

                return false;
            }
        },
        {
            modifier: functionCtor,
            condition: function (astNode) {
                // new Function(...)
                if (astNode.type === SYNTAX.NewExpression && astNode.callee.name === 'Function')
                    return true;

                return false;
            }
        },
        {
            modifier: forin,
            condition: function (astNode) {
                // for(var key in obj)
                if (astNode.type === SYNTAX.ForInStatement) {
                    // for (obj[prop] in src), for (obj['prop'] in src), for (obj.href in src)
                    if (astNode.left.type === SYNTAX.MemberExpression)
                        return true;
                }

                return false;
            }
        },
        {
            modifier: evalArgument,
            condition: function (astNode) {
                if (astNode.type === SYNTAX.CallExpression) {
                    // eval([...]), setTimeout([...]), setInterval([...])
                    if (astNode.callee.type === SYNTAX.Identifier && /^(eval|setTimeout|setInterval)$/.test(astNode.callee.name))
                        return true;

                    // [obj].eval([...]), [obj]['eval']([...]), [obj].setTimeout([...]), [obj]['setTimeout']([...]), [obj].setInterval([...]), [obj]['setInterval']([...])
                    if (astNode.callee.type === SYNTAX.MemberExpression &&
                        /^(eval|setTimeout|setInterval)$/.test(astNode.callee.property.name || astNode.callee.property.value))
                        return true;
                }

                return false;
            }
        },
        {
            modifier: callEvalArgument,
            condition: function (astNode) {
                if (astNode.type === SYNTAX.CallExpression) {
                    // [obj].eval.call([...]), [obj][eval].call([...]), [obj].setTimeout.call([...]), [obj][setTimeout].call([...]),
                    // [obj].setInterval.call([...]), [obj][setInterval].call([...])
                    if (astNode.callee.type === SYNTAX.MemberExpression && astNode.callee.property.name === 'call') {
                        var obj = astNode.callee.object;

                        if (obj.type === SYNTAX.MemberExpression && /^(eval|setTimeout|setInterval)$/.test(obj.property.value || obj.property.name))
                            return true;
                    }

                    // eval.call([...]), setTimeout.call([...]), setInterval.call([...])
                    if (astNode.callee.type === SYNTAX.MemberExpression && astNode.callee.property.name === 'call' &&
                        /^(eval|setTimeout|setInterval)$/.test(astNode.callee.object.name))
                        return true;
                }

                return false;
            }
        },
        {
            modifier: applyEvalArgument,
            condition: function (astNode) {
                if (astNode.type === SYNTAX.CallExpression) {
                    // [obj].eval.apply([...]), [obj][eval].apply([...]), [obj].setTimeout.apply([...]), [obj][setTimeout].apply([...]),
                    // [obj].setInterval.apply([...]), [obj][setInterval].apply([...])
                    if (astNode.callee.type === SYNTAX.MemberExpression && astNode.callee.property.name === 'apply') {
                        var obj = astNode.callee.object;

                        if (obj.type === SYNTAX.MemberExpression && /^(eval|setTimeout|setInterval)$/.test(obj.property.value || obj.property.name))
                            return true;
                    }

                    // eval.apply([...]), setTimeout.apply([...]), setInterval.apply([...])
                    if (astNode.callee.type === SYNTAX.MemberExpression && astNode.callee.property.name === 'apply' &&
                        /^(eval|setTimeout|setInterval)$/.test(astNode.callee.object.name))
                        return true;
                }

                return false;
            }
        },
        {
            modifier: getLocation,
            condition: function (astNode, parent) {
                if (astNode.type === SYNTAX.Identifier) {
                    if (astNode.name !== 'location')
                        return false;

                    // var location = [value];
                    if (parent.type === SYNTAX.VariableDeclarator && parent.id === astNode)
                        return false;

                    // location = [value]
                    if (parent.type === SYNTAX.AssignmentExpression && parent.left === astNode)
                        return false;

                    // [object].location || location.[field]
                    if (parent.type === SYNTAX.MemberExpression)
                        return false;

                    // { location: [value] }
                    if (parent.type === SYNTAX.Property && parent.key === astNode)
                        return false;

                    // location++ || location-- || ++location || --location
                    if (parent.type === SYNTAX.UpdateExpression && parent.operator === '++' || parent.operator === '--')
                        return false;

                    // function (location) { ... } || function func(location) { ... }
                    if ((parent.type === SYNTAX.FunctionExpression ||
                        parent.type === SYNTAX.FunctionDeclaration) && parent.params.indexOf(astNode) !== -1)
                        return false;

                    // Already  modified: __getGlobalProperty('location', location)
                    if (parent.type === SYNTAX.CallExpression && parent.callee.name === JSProcessor.GET_LOCATION_METH_NAME)
                        return false;

                    return true;
                }

                return false;
            }
        },
        {
            modifier: getLocationMember,
            condition: function (astNode, parent) {
                // [object].[field]
                if (astNode.type === SYNTAX.MemberExpression) {
                    // for(location.[field] in [source])
                    if (parent.type === SYNTAX.ForInStatement && parent.left === astNode)
                        return false;

                    // location.[field]
                    if (astNode.object.name === 'location')
                        return true;
                }

                return false;
            }
        },
        {
            modifier: setLocation,
            condition: function (astNode) {
                // [object] = [value]
                if (astNode.type === SYNTAX.AssignmentExpression && astNode.operator === '=') {
                    var leftOperand = astNode.left;

                    // location = [value]
                    if (leftOperand.type === SYNTAX.Identifier && leftOperand.name === 'location')
                        return true;
                }

                return false;
            }
        },
        {
            modifier: memberSet,
            condition: function (astNode) {
                // [object] = [value]
                if (astNode.type === SYNTAX.AssignmentExpression && !astNode.computed && astNode.operator === '=') {
                    var leftOperand = astNode.left;

                    // [object].[field] = []
                    if (leftOperand.type === SYNTAX.MemberExpression &&
                        leftOperand.property.type === SYNTAX.Identifier) {
                        // [object].location = [value]
                        if (needToWrapProperty(leftOperand.property.name))
                            return true;
                    }
                }

                return false;
            }
        },
        {
            modifier: callMethod,
            condition: function (astNode) {
                // [object]()
                if (astNode.type === SYNTAX.CallExpression) {
                    // [object].[field]() || [object][[field]]()
                    if (astNode.callee.type === SYNTAX.MemberExpression) {
                        if (astNode.callee.computed && astNode.callee.property.type === SYNTAX.Literal && !needToWrapMethod(astNode.callee.property.value))
                            return false;

                        if (!astNode.callee.computed && !needToWrapMethod(astNode.callee.property.name))
                            return false;

                        return true;
                    }
                }

                return false;
            }
        },
        {
            modifier: memberGet,
            condition: function (astNode, parent) {
                // [object].[field]
                if (astNode.type === SYNTAX.MemberExpression && !astNode.computed) {
                    if (!needToWrapProperty(astNode.property.name))
                        return false;

                    // [object].[field] = [value]
                    if (parent.type === SYNTAX.AssignmentExpression && parent.left === astNode)
                        return false;

                    // delete [object].[field]
                    if (parent.type === SYNTAX.UnaryExpression && parent.operator === 'delete')
                        return false;

                    // [object].[field]()
                    if (parent.type === SYNTAX.CallExpression && parent.callee === astNode)
                        return false;

                    // [object].[field]++ || [object].[field]-- || ++[object].[field] || --[object].[field]
                    if (parent.type === SYNTAX.UpdateExpression && parent.operator === '++' || parent.operator === '--')
                        return false;

                    // new ([object].[field])() || new ([object].[field])
                    if (parent.type === SYNTAX.NewExpression && parent.callee === astNode)
                        return false;

                    // for([object].[field] in [source])
                    if (parent.type === SYNTAX.ForInStatement && parent.left === astNode)
                        return false;

                    return true;
                }

                return false;
            }
        },
        {
            modifier: computedMemberGet,
            condition: function (astNode, parent) {
                // [object][[field]]
                if (astNode.type === SYNTAX.MemberExpression && astNode.computed) {

                    // [object][[field]] = [value]
                    if (parent.type === SYNTAX.AssignmentExpression && parent.left === astNode)
                        return false;

                    // delete [object][[field]]
                    if (parent.type === SYNTAX.UnaryExpression && parent.operator === 'delete')
                        return false;

                    // [object].[field]++ || [object].[field]-- || ++[object].[field] || --[object].[field]
                    if (parent.type === SYNTAX.UpdateExpression && parent.operator === '++' || parent.operator === '--')
                        return false;

                    // [object][[field]]()
                    if (parent.type === SYNTAX.CallExpression && parent.callee === astNode)
                        return false;

                    // new ([object][[field]])() || new ([object][[field]])
                    if (parent.type === SYNTAX.NewExpression && parent.callee === astNode)
                        return false;

                    // for([object].[[field]] in [source])
                    if (parent.type === SYNTAX.ForInStatement && parent.left === astNode)
                        return false;

                    if (astNode.property.type === SYNTAX.Literal && !needToWrapProperty(astNode.property.value))
                        return false;

                    return true;
                }

                return false;
            }
        },
        {
            modifier: computedMemberSet,
            condition: function (astNode) {
                // [object] = [value]
                if (astNode.type === SYNTAX.AssignmentExpression && astNode.operator === '=') {
                    // [object][[field]] = [value]
                    if (astNode.left.type === SYNTAX.MemberExpression && astNode.left.computed) {
                        // [object].location = [value]
                        if (astNode.left.property.type === SYNTAX.Literal)
                            return needToWrapProperty(astNode.left.property.value);

                        return true;
                    }
                }

                return false;
            }
        },
        {
            modifier: concatOperator,
            condition: function (astNode) {
                // [object] += [value]
                if (astNode.type === SYNTAX.AssignmentExpression && astNode.operator === '+=')
                    return true;

                return false;
            }
        }
    ];

    function modify(ast, parent, key) {
        var modified = false;

        if (!ast || (typeof ast !== 'object'))
            return modified;

        if (ast.type) {
            for (var i = 0; i < modifiers.length; i++) {
                if (modifiers[i].condition(ast, parent)) {
                    var needToModify = modifiers[i].modifier(ast, parent, key);

                    modified = true;
                    if (needToModify)
                        modified = modify(parent[key], parent, key) || modified;
                }
            }
        }

        for (var astKey in ast) {
            if (ast.hasOwnProperty(astKey)) {
                var childNode = ast[astKey];

                if (Object.prototype.toString.call(childNode) === '[object Array]') {
                    for (var j = 0; j < childNode.length; j++)
                        modified = modify(childNode[j], ast, astKey) || modified;
                } else
                    modified = modify(childNode, ast, astKey) || modified;
            }
        }

        return modified;
    }

    // AST templates
    function getProcessScriptMethAst(args) {
        return {
            type: SYNTAX.CallExpression,
            callee: {
                type: SYNTAX.Identifier,
                name: JSProcessor.PROCESS_SCRIPT_METH_NAME
            },
            arguments: [
                args[0]
            ]
        };
    }

    function getGetLocationMethAst() {
        return {
            type: SYNTAX.CallExpression,
            callee: {
                type: SYNTAX.Identifier,
                name: JSProcessor.GET_LOCATION_METH_NAME
            },
            arguments: [
                {
                    type: SYNTAX.Identifier,
                    name: 'location'
                }
            ]
        };
    }

    function getSetLocationMethAst(value) {
        return {
            type: SYNTAX.CallExpression,
            callee: {
                type: SYNTAX.MemberExpression,
                computed: false,
                object: {
                    type: SYNTAX.FunctionExpression,
                    id: null,
                    params: [],
                    defaults: [],
                    body: {
                        type: SYNTAX.BlockStatement,
                        body: [
                            {
                                type: SYNTAX.ReturnStatement,
                                argument: {
                                    type: SYNTAX.LogicalExpression,
                                    operator: '||',
                                    left: {
                                        type: SYNTAX.CallExpression,
                                        callee: {
                                            type: SYNTAX.Identifier,
                                            name: JSProcessor.SET_LOCATION_METH_NAME
                                        },
                                        arguments: [
                                            {
                                                type: SYNTAX.Identifier,
                                                name: 'location'
                                            },
                                            value
                                        ]
                                    },
                                    right: {
                                        type: SYNTAX.AssignmentExpression,
                                        operator: '=',
                                        left: {
                                            type: SYNTAX.Identifier,
                                            name: 'location'
                                        },
                                        right: value
                                    }
                                }
                            }
                        ]
                    },
                    "rest": null,
                    "generator": false,
                    "expression": false
                },
                property: {
                    type: SYNTAX.Identifier,
                    name: "apply"
                }
            },
            arguments: [
                {
                    type: SYNTAX.ThisExpression
                }
            ]
        };
    }

    function getSetMethAst(propertyName, obj, value) {
        return {
            type: SYNTAX.CallExpression,
            callee: {
                type: SYNTAX.Identifier,
                name: JSProcessor.SET_PROPERTY_METH_NAME
            },
            arguments: [
                obj, {
                    type: SYNTAX.Literal,
                    value: propertyName,
                    raw: '"' + propertyName + '"'
                },
                value
            ]
        };
    }

    function getCallMethodMthAst(owner, meth, args) {
        return {
            type: SYNTAX.CallExpression,
            callee: {
                type: SYNTAX.Identifier,
                name: JSProcessor.CALL_METHOD_METH_NAME
            },
            arguments: [
                owner,
                meth,
                {
                    type: SYNTAX.ArrayExpression,
                    elements: args
                }
            ]
        };
    }

    function getGetMethAst(propertyName, owner) {
        return {
            type: SYNTAX.CallExpression,
            callee: {
                type: SYNTAX.Identifier,
                name: JSProcessor.GET_PROPERTY_METH_NAME
            },
            arguments: [
                owner, {
                    type: SYNTAX.Literal,
                    value: propertyName,
                    raw: '"' + propertyName + '"'
                }
            ]
        };
    }

    function getGetComputedMethAst(property, owner) {
        return {
            type: SYNTAX.CallExpression,
            callee: {
                type: SYNTAX.Identifier,
                name: JSProcessor.GET_PROPERTY_METH_NAME
            },
            arguments: [
                owner,
                property
            ]
        };
    }

    function getSetComputedMethAst(property, owner, value) {
        return {
            type: SYNTAX.CallExpression,
            callee: {
                type: SYNTAX.Identifier,
                name: JSProcessor.SET_PROPERTY_METH_NAME
            },
            arguments: [
                owner,
                property,
                value
            ]
        };
    }

    function getConcatOperatorAst(left, right) {
        return {
            type: SYNTAX.AssignmentExpression,
            operator: '=',
            left: left,
            right: {
                "type": SYNTAX.BinaryExpression,
                "operator": '+',
                left: left,
                right: right
            }
        };
    }

    function getDocumentWriteArgAst(arg) {
        return {
            type: SYNTAX.Literal,
            value: arg,
            raw: '\'' + arg + '\''
        };
    }

    function getDocumentWriteStatementIndices(statements) {
        var indices = [];

        var isExpressionStatement = function (statement) {
                return statement.type === SYNTAX.ExpressionStatement;
            },
            isCallStatement = function (statement) {
                return statement.expression.type === SYNTAX.CallExpression;
            },
            isMember = function (statement) {
                return statement.expression.callee.type === SYNTAX.MemberExpression;
            },
            isDocumentWrite = function (statement) {
                return statement.expression.callee.property.name === 'write' ||
                    statement.expression.callee.property.name === 'writeln';
            };

        for (var i = 0; i < statements.length; i++) {
            var statement = statements[i];

            if (isExpressionStatement(statement) && isCallStatement(statement) && isMember(statement) && isDocumentWrite(statement)) {
                indices.push(i);
            }
        }

        return indices;
    }

    // Modifiers
    function updateAstNode(node, newNode, parent, key) {
        if (key === 'arguments' || key === 'elements' || key === 'expressions') {
            var index = parent[key].indexOf(node);

            parent[key][index] = newNode;
        } else
            parent[key] = newNode;
    }

    // for(obj[i++] in src), for(obj['href'] in src), for(obj.href in src)
    function forin(astNode) {
        // for(obj[i++] in src) --> for(__set$temp in src) { __set$(obj, i++, __set$temp); }
        var tempVarAst = {
            type: SYNTAX.Identifier,
            name: JSProcessor.FOR_IN_TEMP_VAR_NAME
        };

        astNode.body.body.unshift({
            type: SYNTAX.ExpressionStatement,
            expression: {
                type: SYNTAX.AssignmentExpression,
                operator: '=',
                left: astNode.left,
                right: tempVarAst
            }
        });

        astNode.left = {
            type: SYNTAX.VariableDeclaration,
            declarations: [
                {
                    type: SYNTAX.VariableDeclarator,
                    id: tempVarAst,
                    init: null
                }
            ],
            kind: 'var'
        };

        return true;
    }

    // new Function([, params], [body]);
    function functionCtor(astNode) {
        if (!astNode.arguments.length)
            return false;

        var lastArgIndex = astNode.arguments.length - 1;

        // new Function([, params], [body]); --> new Function([, params], __proc$Script([body]));
        astNode.arguments[lastArgIndex] = getProcessScriptMethAst([astNode.arguments[lastArgIndex]]);

        return false;
    }

    // { ... [obj].write([html]); ... [obj].writeln([html]); ... }
    function documentWrite(astNode) {
        var indices = getDocumentWriteStatementIndices(astNode.body);

        // { ... [obj].write([html]); ... [obj].writeln([html]); ... } -->
        // { ... [obj].write([html], __begin$); ... [obj].writeln([html], __end$); ... }
        astNode.body[indices[0]].expression.arguments.push(getDocumentWriteArgAst(JSProcessor.DOCUMENT_WRITE_BEGIN_PARAM));
        astNode.body[indices[indices.length - 1]].expression.arguments.push(getDocumentWriteArgAst(JSProcessor.DOCUMENT_WRITE_END_PARAM));

        return false;
    }

    // eval(), window.eval(), window['eval']
    function evalArgument(astNode) {
        if (!astNode.arguments.length)
            return false;

        // eval(script) --> eval(__proc$Script(script))
        var newArg = getProcessScriptMethAst(astNode.arguments);

        astNode.arguments[0] = newArg;

        return false;
    }

    // eval.call(), window.eval.call(), window['eval'].call()
    function callEvalArgument(astNode) {
        // eval.call(window, script) --> eval.call(window, __proc$Script(script))
        var newArg = getProcessScriptMethAst([astNode.arguments[1]]);

        astNode.arguments[1] = newArg;

        return false;
    }

    // eval.apply(), window.eval.apply(), window['eval'].apply()
    function applyEvalArgument(astNode) {
        // eval.apply(window, [script]) --> eval.apply(window, [__proc$Script(script)])
        var newArg = getProcessScriptMethAst([astNode.arguments[1].elements[0]]);

        astNode.arguments[1].elements[0] = newArg;

        return false;
    }

    // location
    function getLocation(astNode, parent, key) {
        // location --> __get$Loc(location)
        var newNode = getGetLocationMethAst();

        updateAstNode(astNode, newNode, parent, key);

        return false;
    }

    // location.[field]
    function getLocationMember(astNode) {
        // location.[field]  --> __get$Loc(location).[field]
        // location[[field]] --> __get$(__get$Loc(location), [field])
        var newNode = getGetLocationMethAst(astNode.object);

        astNode.object = newNode;

        return false;
    }

    // location = [value]
    function setLocation(astNode, parent, key) {
        // location = [value] --> (function(){ return __set$Loc(location, [value]) || location = [value];}.apply(this))
        var newNode = getSetLocationMethAst(astNode.right);

        updateAstNode(astNode, newNode, parent, key);

        return false;
    }

    // [object].location = [value]
    function memberSet(astNode, parent, key) {
        // [any].location = [value] --> __set$([object], 'location', [value])
        var newNode = getSetMethAst(astNode.left.property.name, astNode.left.object, astNode.right);

        updateAstNode(astNode, newNode, parent, key);

        return true;
    }

    // [object].location
    function memberGet(astNode, parent, key) {
        // [object].location --> __get$([object], 'location')
        var newNode = getGetMethAst(astNode.property.name, astNode.object);

        updateAstNode(astNode, newNode, parent, key);

        return true;
    }

    // [object].[method]() || [object][[method]]()
    function callMethod(astNode, parent, key) {
        var meth = null;

        if (!astNode.callee.computed) {
            meth = {
                type: SYNTAX.Literal,
                value: astNode.callee.property.name,
                raw: '"' + astNode.callee.property.name + '"'
            };
        } else
            meth = astNode.callee.property;

        // [object].[method]([args]) --> _call$([object], [method], [args])
        // [object][[method]]([args]) --> _call$([object], [method], [args])
        var newNode = getCallMethodMthAst(astNode.callee.object, meth, astNode.arguments);

        updateAstNode(astNode, newNode, parent, key);

        return true;
    }

    // [object][[field]]
    function computedMemberGet(astNode, parent, key) {
        //[object][[field]] --> __get$([object], [field])
        var newNode = getGetComputedMethAst(astNode.property, astNode.object);

        updateAstNode(astNode, newNode, parent, key);

        return true;
    }

    // [object][[field]] = [value]
    function computedMemberSet(astNode, parent, key) {
        //[object][[field]] = [value] --> __set$([object], [field], [value])
        var newNode = getSetComputedMethAst(astNode.left.property, astNode.left.object, astNode.right);

        updateAstNode(astNode, newNode, parent, key);

        return true;
    }

    // [object] += [value]
    function concatOperator(astNode, parent, key) {
        //[object] += [value] --> [object] = [object] + [value]
        var newNode = getConcatOperatorAst(astNode.left, astNode.right);

        updateAstNode(astNode, newNode, parent, key);

        return true;
    }

    if (typeof module !== 'undefined' && module.exports)
        module.exports = JSProcessor;
    else {
        HammerheadClient.define('Shared.JSProcessor', function () {
            this.exports = JSProcessor;
        });
    }
})();
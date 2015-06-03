var jsProcessor = require('../../../../hammerhead/shared/js_processor'),
    testUtils   = require('../../test_utils');

var ESCODEGEN_PATH_WARNING =
        'ATTENTION! If this test fails seems like you have updated escodegen.\n' +
        'We have patched escodegen to make it work with raw Literals.\n' +
        '\n' +
        'HOW TO FIX - go to escodegen an replace this code:\n' +
        '------------------------------------------\n' +
        'if (expr.hasOwnProperty(\'raw\') && parse) {\n' +
        '   try {\n' +
        '       raw = parse(expr.raw).body[0].expression;\n' +
        '       if (raw.type === Syntax.Literal) {\n' +
        '           if (raw.value === expr.value) {\n' +
        '               result = expr.raw;\n' +
        '               break;\n' +
        '           }\n' +
        '       }\n' +
        '   } catch (e) {\n' +
        '       // not use raw property\n' +
        '   }\n' +
        '};\n' +
        '-------------------------------------------\n' +
        '\n' +
        'with this code:\n' +
        '\n' +
        '-------------------------------------------\n' +
        'if (expr.hasOwnProperty(\'raw\')) {\n' +
        '   result = expr.raw;\n' +
        '   break;\n' +
        '}\n' +
        '-------------------------------------------\n';

var ESCODEGEN_T170848_PATH_WARNING =
        'ATTENTION! If this test fails seems like you have updated escodegen.\n' +
        'We have patched escodegen to make it work for T170848.\n' +
        '\n' +
        'HOW TO FIX - go to escodegen and add this code to the BlockStatement gen before stmt body items generation:\n' +
        '------------------------------------------\n' +
        'if (settings.functionBody && !$body.length)' +
        '   _.js += "/**/";';

var ACORN_UNICODE_WARNING =
        'ATTENTION! If this test fails seems like you have updated acorn.\n' +
        'We have patched acorn to make it work with unicode identifiers.\n' +
        '\n' +
        'HOW TO FIX - go to acorn an replace this code:\n' +
        '------------------------------------------\n' +
        'function readWord1() {\n' +
        '   ...\n' +
        '   word += escStr;\n' +
        '   ...\n' +
        '}\n' +
        '-------------------------------------------\n' +
        '\n' +
        'with this code:\n' +
        '\n' +
        '-------------------------------------------\n' +
        'function readWord1() {\n' +
        '   ...\n' +
        '   word += input.substr(tokPos-6, 6);\n' +
        '   ...\n' +
        '}\n' +
        '-------------------------------------------\n';

var ACORN_PATH_WARNING =
        'ATTENTION! If this test fails seems like you have updated acorn.\n' +
        'We have patched acorn to make it work "Property" nodes.\n' +
        '\n' +
        'HOW TO FIX - go to acorn an replace this code:\n' +
        '------------------------------------------\n' +
        'var prop = {key: parsePropertyName()}, isGetSet = false, kind;\n' +
        '-------------------------------------------\n' +
        '\n' +
        'with this code:\n' +
        '\n' +
        '-------------------------------------------\n' +
        'var prop = {type: "Property", key: parsePropertyName()}, isGetSet = false, kind;\n' +
        '-------------------------------------------\n';

function check (testData, t) {
    for (var i = 0; i < testData.length; i++) {
        var res = jsProcessor.process(testData[i].src);

        var assertionText = 'Source: ' + testData[i].src + ' Result: ' + res + ' Expected: ' + testData[i].expected;

        if (testData[i].additionalAssertionText)
            assertionText += '\n' + testData[i].additionalAssertionText;

        t.ok(testUtils.compareCode(res, testData[i].expected), assertionText);
    }
}

function getTestData (template, value) {
    var result = [];

    for (var i = 0; i < template.length; i++) {
        result.push({
            src:      template[i].src.replace(/\{0\}/g, value),
            expected: template[i].expected.replace(/\{0\}/g, value)
        })
    }

    return result;
}

exports['JS Processor'] = {
    'Get/set location': function (t) {
        var testData = [
            { src: 'var location = value', expected: 'var location = value' },
            {
                src:      'location = value',
                expected: '(function() { return __set$Loc(location, value) || (location = value); }.apply(this))'
            },
            { src: '{ location: 123 }', expected: '{ location: 123 }', additionalAssertionText: ACORN_PATH_WARNING },
            { src: '[ location ]', expected: '[ __get$Loc(location) ]' },
            { src: 'var loc = location', expected: 'var loc = __get$Loc(location)' },
            { src: 'location ? true : false', expected: '__get$Loc(location) ? true : false' },
            { src: 'location + ""', expected: '__get$Loc(location) + ""' },
            { src: 'location.hostname', expected: '__get$(__get$Loc(location), "hostname")' },
            { src: 'location["hostname"]', expected: '__get$(__get$Loc(location), "hostname")' },
            { src: 'location[hostname]', expected: '__get$(__get$Loc(location), hostname)' },
            { src: 'location.href', expected: '__get$(__get$Loc(location), "href")' },
            { src: 'var func = function(location){}', expected: 'var func = function(location){}' },
            { src: 'function func(location){}', expected: 'function func(location){}' },
            { src: 'location[someProperty]', expected: '__get$(__get$Loc(location), someProperty)' },
            { src: 'location.host.toString()', expected: '__get$(__get$Loc(location), "host").toString()' },
            { src: 'location[host].toString()', expected: '__get$(__get$Loc(location), host).toString()' },
            {
                src:                     'temp = { location: value, value: location }',
                expected:                'temp = { location: value, value: __get$Loc(location) }',
                additionalAssertionText: ACORN_PATH_WARNING
            },

            { src: '--location', expected: '--location' },
            { src: 'location--', expected: 'location--' },
            { src: 'location++', expected: 'location++' },
            { src: '++location', expected: '++location' },

            {
                src:      'location+=value',
                expected: '(function(){return __set$Loc(location,__get$Loc(location)+value)||(location=__get$Loc(location)+value);}.apply(this))'
            },
            {
                src:      'location+=location+value',
                expected: '(function(){return __set$Loc(location,__get$Loc(location)+(__get$Loc(location)+value))||(location=__get$Loc(location)+(__get$Loc(location)+value));}.apply(this))'
            },
            {
                src:      'location.hostname+=value',
                expected: '__set$(__get$Loc(location), "hostname", __get$(__get$Loc(location), "hostname") + value)'
            },
            {
                src:      'location.href+=value',
                expected: '__set$(__get$Loc(location), "href", __get$(__get$Loc(location), "href") + value)'
            },
            {
                src:      'location[hostname]+=value',
                expected: '__set$(__get$Loc(location), hostname, __get$(__get$Loc(location), hostname) + value)'
            },
            {
                src:      'location["hostname"]+=value',
                expected: '__set$(__get$Loc(location), "hostname", __get$(__get$Loc(location), "hostname") + value)'
            },
            {
                src:      'location["href"]+=value',
                expected: '__set$(__get$Loc(location), "href", __get$(__get$Loc(location), "href") + value) '
            },

            {
                src:      'location-=value;location*=value;location/=value;location>>=value;location<<=value;location>>>=value;' +
                          'location&=value;location|=value;location^=value',
                expected: 'location-=value;location*=value;location/=value;location>>=value;location<<=value;location>>>=value;' +
                          'location&=value;location|=value;location^=value'
            }
        ];

        check(testData, t);

        t.done();
    },

    'Concat operator': function (t) {
        check([
            { src: 'prop += 1', expected: 'prop = prop + 1' },
            { src: 'prop += 2 + prop + 1', expected: 'prop = prop + (2 + prop + 1)' }
        ], t);

        t.done();
    },

    'new Function': function (t) {
        check([
            { src: 'new Function();', expected: 'new Function();' },
            { src: 'new Function(\'return a.href;\');', expected: 'new Function(__proc$Script(\'return a.href;\'));' },
            { src: 'new Function("x", "y", body);', expected: 'new Function("x", "y", __proc$Script(body));' }
        ], t);

        t.done();
    },

    'Get/set property': function (t) {
        var testDataTemplate = [
            { src: 'obj.{0}', expected: '__get$(obj, "{0}")' },
            { src: 'obj.{0} = value', expected: '__set$(obj, "{0}", value)' },
            { src: 'obj.{0}.subProp', expected: '__get$(obj, "{0}").subProp' },
            { src: 'obj.{0}.{0} = value', expected: '__set$(__get$(obj, "{0}"),"{0}", value)' },
            { src: 'delete obj.{0}', expected: 'delete obj.{0}' },
            { src: 'obj.{0}.method()', expected: '__get$(obj, "{0}").method()' },
            { src: 'new (obj.{0})()', expected: 'new (obj.{0})()' },

            { src: '--obj.{0}', expected: '--obj.{0}' },
            { src: 'obj.{0}--', expected: 'obj.{0}--' },
            { src: 'obj.{0}++', expected: 'obj.{0}++' },
            { src: '++obj.{0}', expected: '++obj.{0}' },
            { src: 'obj.{0}()', expected: 'obj.{0}()' },

            { src: 'obj.{0}+=value', expected: '__set$(obj, "{0}", __get$(obj, "{0}")+value)' },
            {
                src:      'obj.{0}+=obj.{0}+value',
                expected: '__set$(obj,"{0}",__get$(obj, "{0}")+(__get$(obj, "{0}")+value))'
            },
            { src: 'obj.{0}.field+=value', expected: '__get$(obj, "{0}").field = __get$(obj, "{0}").field + value' },
            {
                src:      'obj.{0}[field]+=value',
                expected: '__set$(__get$(obj,"{0}"),field,__get$(__get$(obj,"{0}"), field) + value)'
            },
            {
                src:      'obj.{0}["field"]+=value',
                expected: '__get$(obj,"{0}")["field"]=__get$(obj,"{0}")["field"] + value'
            },
            {
                src:      'obj.{0}["href"]+=value',
                expected: '__set$(__get$(obj,"{0}"),"href", __get$(__get$(obj,"{0}"), "href") + value)'
            },
            { src: 'result = $el[0].{0}', expected: 'result = __get$($el[0], "{0}")' },

            {
                src:      'obj.{0}-=value;obj.{0}*=value;obj.{0}/=value;obj.{0}>>=value;obj.{0}<<=value;obj.{0}>>>=value;' +
                          'obj.{0}&=value;obj.{0}|=value;obj.{0}^=value',
                expected: 'obj.{0}-=value;obj.{0}*=value;obj.{0}/=value;obj.{0}>>=value;obj.{0}<<=value;obj.{0}>>>=value;' +
                          'obj.{0}&=value;obj.{0}|=value;obj.{0}^=value'
            }
        ];

        var wrappedProperties = jsProcessor.wrappedProperties;

        for (var property in wrappedProperties) {
            if (wrappedProperties.hasOwnProperty(property))
                check(getTestData(testDataTemplate, property), t);
        }

        t.done();
    },

    'Get/set property member': function (t) {
        var testDataTemplate = [
            { src: 'var temp = "location"; obj[t]', expected: 'var temp = "location";__get$(obj, t)' },
            {
                src:      'obj[prop1]["prop2"].{0}.{0} = value',
                expected: '__set$(__get$(__get$(obj, prop1)["prop2"], "{0}"),"{0}", value)'
            },
            { src: 'obj[someProperty] = value', expected: '__set$(obj, someProperty, value)' },
            { src: 'delete obj[{0}]', expected: 'delete obj[{0}]' },
            { src: 'obj.{0} = value, obj1 = value', expected: '__set$(obj,"{0}",value), obj1 = value' },
            { src: 'new (obj["{0}"])()', expected: 'new (obj["{0}"])()' },

            { src: '--obj[{0}]', expected: '--obj[{0}]' },
            { src: 'obj[{0}]--', expected: 'obj[{0}]--' },
            { src: 'obj[0]++', expected: 'obj[0]++' },
            { src: '++obj[0]', expected: '++obj[0]' },
            { src: 'obj[someProperty](1,2,3)', expected: '__call$(obj,someProperty,[1,2,3])' },
            {
                src:      'obj[{0}]-=value;obj[{0}]*=value;obj[{0}]/=value;obj[{0}]>>=value;obj[{0}]<<=value;obj[{0}]>>>=value;' +
                          'obj[{0}]&=value;obj[{0}]|=value;obj[{0}]^=value',
                expected: 'obj[{0}]-=value;obj[{0}]*=value;obj[{0}]/=value;obj[{0}]>>=value;obj[{0}]<<=value;obj[{0}]>>>=value;' +
                          'obj[{0}]&=value;obj[{0}]|=value;obj[{0}]^=value'
            }
        ];

        var wrappedProperties = jsProcessor.wrappedProperties;

        for (var property in wrappedProperties) {
            if (wrappedProperties.hasOwnProperty(property))
                check(getTestData(testDataTemplate, property), t);
        }

        t.done();
    },

    'Object': function (t) {
        check([
            {
                src:                     '{ location: value, value: location, src: src }',
                expected:                '{ location: value, value: __get$Loc(location), src: src }',
                additionalAssertionText: ACORN_PATH_WARNING
            }
        ], t);
        t.done();
    },

    'Array': function (t) {
        check([{ src: '[ location, "location.href" ]', expected: '[__get$Loc(location), "location.href" ]' }], t);
        t.done();
    },

    'Keep raw string literals': function (t) {
        check([
            {
                src:                     'obj["\\u003c/script>"]=location',
                expected:                'obj["\\u003c/script>"]=__get$Loc(location)',
                additionalAssertionText: ESCODEGEN_PATH_WARNING
            }
        ], t);

        t.done();
    },

    'Eval': function (t) {
        check([
            { src: 'eval(script)', expected: 'eval(__proc$Script(script))' },
            { src: 'eval("script")', expected: 'eval(__proc$Script("script"))' },
            { src: 'window.eval(script)', expected: 'window.eval(__proc$Script(script))' },
            { src: 'window["eval"](script)', expected: 'window["eval"](__proc$Script(script))' },

            { src: 'eval.call(window, script)', expected: 'eval.call(window, __proc$Script(script))' },
            { src: 'eval.call(window, "script")', expected: 'eval.call(window, __proc$Script("script"))' },
            { src: 'window.eval.call(window, script)', expected: 'window.eval.call(window, __proc$Script(script))' },
            {
                src:      'window["eval"].call(window, script)',
                expected: 'window["eval"].call(window, __proc$Script(script))'
            },

            { src: 'eval.apply(window, [script])', expected: 'eval.apply(window, [__proc$Script(script)])' },
            { src: 'eval.apply(window, ["script"])', expected: 'eval.apply(window, [__proc$Script("script")])' },
            {
                src:      'window.eval.apply(window, [script])',
                expected: 'window.eval.apply(window, [__proc$Script(script)])'
            },
            {
                src:      'window["eval"].apply(window, [script])',
                expected: 'window["eval"].apply(window, [__proc$Script(script)])'
            }
        ], t);

        t.done();
    },

    'SetTimeout': function (t) {
        check([
            { src: 'setTimeout(script, 0)', expected: 'setTimeout(__proc$Script(script), 0)' },
            { src: 'setTimeout("script", 0)', expected: 'setTimeout(__proc$Script("script"), 0)' },
            { src: 'window.setTimeout(script, 0)', expected: 'window.setTimeout(__proc$Script(script), 0)' },
            { src: 'window["setTimeout"](script, 0)', expected: 'window["setTimeout"](__proc$Script(script), 0)' },

            {
                src:      'setTimeout.call(window, script, 0)',
                expected: 'setTimeout.call(window, __proc$Script(script), 0)'
            },
            {
                src:      'setTimeout.call(window, "script", 0)',
                expected: 'setTimeout.call(window, __proc$Script("script"), 0)'
            },
            {
                src:      'window.setTimeout.call(window, script, 0)',
                expected: 'window.setTimeout.call(window, __proc$Script(script), 0)'
            },
            {
                src:      'window["setTimeout"].call(window, script, 0)',
                expected: 'window["setTimeout"].call(window, __proc$Script(script), 0)'
            },

            {
                src:      'setTimeout.apply(window, [script, 0])',
                expected: 'setTimeout.apply(window, [__proc$Script(script), 0])'
            },
            {
                src:      'setTimeout.apply(window, ["script", 0])',
                expected: 'setTimeout.apply(window, [__proc$Script("script"), 0])'
            },
            {
                src:      'window.setTimeout.apply(window, [script, 0])',
                expected: 'window.setTimeout.apply(window, [__proc$Script(script), 0])'
            },
            {
                src:      'window["setTimeout"].apply(window, [script, 0])',
                expected: 'window["setTimeout"].apply(window, [__proc$Script(script), 0])'
            }
        ], t);

        t.done();
    },

    'SetInterval': function (t) {
        check([
            { src: 'setInterval(script, 0)', expected: 'setInterval(__proc$Script(script), 0)' },
            { src: 'setInterval("script", 0)', expected: 'setInterval(__proc$Script("script"), 0)' },
            { src: 'window.setInterval(script, 0)', expected: 'window.setInterval(__proc$Script(script), 0)' },
            { src: 'window["setInterval"](script, 0)', expected: 'window["setInterval"](__proc$Script(script), 0)' },

            {
                src:      'setInterval.call(window, script, 0)',
                expected: 'setInterval.call(window, __proc$Script(script), 0)'
            },
            {
                src:      'setInterval.call(window, "script", 0)',
                expected: 'setInterval.call(window, __proc$Script("script"), 0)'
            },
            {
                src:      'window.setInterval.call(window, script, 0)',
                expected: 'window.setInterval.call(window, __proc$Script(script), 0)'
            },
            {
                src:      'window["setInterval"].call(window, script, 0)',
                expected: 'window["setInterval"].call(window, __proc$Script(script), 0)'
            },

            {
                src:      'setInterval.apply(window, [script, 0])',
                expected: 'setInterval.apply(window, [__proc$Script(script), 0])'
            },
            {
                src:      'setInterval.apply(window, ["script", 0])',
                expected: 'setInterval.apply(window, [__proc$Script("script"), 0])'
            },
            {
                src:      'window.setInterval.apply(window, [script, 0])',
                expected: 'window.setInterval.apply(window, [__proc$Script(script), 0])'
            },
            {
                src:      'window["setInterval"].apply(window, [script, 0])',
                expected: 'window["setInterval"].apply(window, [__proc$Script(script), 0])'
            }
        ], t);

        t.done();
    },

    'postMessage': function (t) {
        check([
            { src: 'window.postMessage("", "")', expected: '__call$(window, "postMessage", ["", ""])' },
            { src: 'window["postMessage"]("", "")', expected: '__call$(window, "postMessage", ["", ""])' },
            { src: 'window[postMessage]("", "")', expected: '__call$(window, postMessage, ["", ""])' },
            { src: 'window["some"]("", "")', expected: 'window["some"]("", "")' },
            { src: 'window.some.("", "")', expected: 'window.some.("", "")' }
        ], t);

        t.done();
    },

    'isScriptProcessed method': function (t) {
        var script          = '//comment\n var temp = 0; \n var host = location.host; \n temp = 1; \n // comment',
            processedScript = jsProcessor.process(script);

        t.ok(!jsProcessor.isScriptProcessed(script));
        t.ok(jsProcessor.isScriptProcessed(processedScript));

        t.done();
    },

    'document.write, document.writeln': function (t) {
        var script   =
                'var doc = document;' +
                'doc.write("some html", "html");' +
                'var g = obj.href;' +
                'if(false){' +
                '   doc.writeln("some html", "html");' +
                '   g = obj.href;' +
                '}' +
                'doc.writeln("some html", "html");',

            expected =
                'var doc = document;' +
                '__call$(doc, "write", ["some html", "html", "__begin$"]);' +
                'var g = __get$(obj, "href");' +
                'if(false){' +
                '   __call$(doc, "writeln", ["some html", "html"]);' +
                '   g = __get$(obj, "href");' +
                '}' +
                '__call$(doc, "writeln", ["some html", "html", "__end$"]);';

        check([
            { src: script, expected: expected },
            { src: 'function test(){' + script + '}', expected: 'function test(){' + expected + '}' }
        ], t);

        t.done();
    },

    'forin': function (t) {
        check([
            { src: 'for(obj.prop in src){}', expected: 'for(var __set$temp in src){obj.prop = __set$temp;}' },
            { src: 'for(obj["prop"] in src){}', expected: 'for(var __set$temp in src){obj["prop"] = __set$temp;}' },
            { src: 'for(obj[i++] in src){}', expected: 'for(var __set$temp in src){__set$(obj, i++, __set$temp);}' },
            { src: 'for(obj.href in src){}', expected: 'for(var __set$temp in src){__set$(obj, "href", __set$temp);}' },
            {
                src:      'for(obj["href"] in src){}',
                expected: 'for(var __set$temp in src){__set$(obj, "href", __set$temp);}'
            }
        ], t);

        t.done();
    },

    'Unicode identifiers': function (t) {
        check([
            {
                src:                     '({\\u00c0:"value"})[value]',
                expected:                '__get$({\\u00c0:"value"}, value)',
                additionalAssertionText: ACORN_UNICODE_WARNING
            },
            { src: '({"\\u00c0":"value"})[value]', expected: '__get$({"\\u00c0":"value"}, value)' }
        ], t);

        t.done();
    },

    'Patch function "isUseStrict" in js_parsing_tools for ignore strict mode errors': function (t) {
        check([
            { src: '"use strict";var let=0;obj.src;', expected: '"use strict";var let=0;__get$(obj,"src");' },
            {
                src:      '"use strict";var obj={yield:function(){}};obj.src;',
                expected: '"use strict";var obj={yield:function(){/**/}};__get$(obj, "src");'
            }
        ], t);

        t.done();
    },

    'T170848: TD_14_2 - "Uncaught SyntaxError: Unexpected token u" on starting recording at bbc.co.uk': function (t) {
        check([
            {
                src:                     'function test(){} a.src=function(){};',
                expected:                'function test(){/**/}__set$(a,"src",function(){/**/});',
                additionalAssertionText: ESCODEGEN_T170848_PATH_WARNING
            }
        ], t);

        t.done();
    },

    'T209250: Health monitor - js processor error (seznam.cz)': function (t) {
        check([
            {
                src:      '{ (function() { a.src = "success"; })(); }',
                expected: '{ (function() { __set$(a, "src", "success");}()); }'
            }
        ], t);

        t.done();
    },

    'T226589: 15.1 Testing - JsProcessor removes code together with html comments (http://www.goo.ne.jp/)': function (t) {
        var script = 'document.writeln("<!--FID:23239-->");\n' +
                     '<!--Begin JSERVER Skip-->\n' +
                     '<!--\n' +
                     'google_ad_client = "ca-pub-4457128893836381";\n' +
                     '/* [PC]goo_TOP_1st_300_250 ã¬ã¯ã¿ã³ã°ã« */\n' +
                     'google_ad_slot = "6623725261";\n' +
                     'google_ad_width = 300;\n' +
                     'google_ad_height = 250;\n' +
                     '//-->\n\n' +
                     '<!--End JSERVER Skip-->\n' +
                     'document.writeln("var t = 1;");\n' +
                     'document.writeln("t = 2;");\n' +
                     'document.close();\n';

        var expected = '__call$(document, "writeln", ["<!--FID:23239-->", \'__begin$\']);' +
                       'google_ad_client = "ca-pub-4457128893836381";' +
                       'google_ad_slot = "6623725261";' +
                       'google_ad_width = 300;' +
                       'google_ad_height = 250;' +
                       '__call$(document, "writeln", ["var t = 1;"]);' +
                       '__call$(document, "writeln", ["t = 2;", \'__end$\']);' +
                       'document.close();';

        check([
            {
                src:      script,
                expected: expected
            }
        ], t);

        t.done();
    },

    'T232454: TD15.1 - Error on loading page https://openui5.hana.ondemand.com/test-resources/sap/m/demokit/cart/index.html?responderOn=true': function (t) {
        var script = 'if(true) {\n' +
                     'document.write("<html>");\n' +
                     'document.writeln("</html>");\n' +
                     '}\n';

        var expected = 'if (true) {\n' +
                       '__call$(document, "write", ["<html>", \'__begin$\']);\n' +
                       '__call$(document, "writeln", ["</html>", \'__end$\']);\n' +
                       '}';

        check([
            {
                src:      script,
                expected: expected
            }
        ], t);

        t.done();
    },

    'T239244: TD15.1 - js error \'Unexpected token ;\' on the http://www.rbinternational.com/ site': function (t) {
        var src      = '<!-- rai_mm_tools -->\n' +
                       '<!--\n' +
                       'function MM_openBrWindow(theURL,winName,features) { //v2.0\n' +
                       '   a[i];\n' +
                       '}\n' +
                       '//-->',
            expected = 'function MM_openBrWindow(theURL,winName,features) {\n' +
                       '   __get$(a, i);\n' +
                       '}';

        check([{
            src:      src,
            expected: expected
        }], t);

        t.done();
    },

    'Html comments': function (t) {
        check([{
            src:      'a[i];\n<!-- comment -->',
            expected: '__get$(a, i)'
        }, {
            src:      '<!-- comment -->\n a[i];',
            expected: '__get$(a, i);'
        }, {
            src:      ' <!-- comment -->\n a[i];',
            expected: '__get$(a, i);'
        }, {
            src:      '\n<!-- comment -->\n a[i];',
            expected: '__get$(a, i);'
        }, {
            src:      '<!-- comment1 -->\n<!-- comment2 -->\n a[i];',
            expected: '__get$(a, i);'
        }, {
            src:      '<!-- comment1 -->\n a[i];\n<!-- comment2 -->',
            expected: '__get$(a, i)'
        }, {
            src:      'var t = "<!-- comment1 -->\\n";\na[i];',
            expected: 'var t = "<!-- comment1 -->\\n";\n__get$(a, i);'
        }], t);

        t.done();
    },

    'Health monitor - wrong js processing (sidex.ru)': function (t) {
        var src           = '<!--\n' + 'dn="SIDEX.RU";\n' + 'a[i]\n' + '// -->',
            expected      = 'dn="SIDEX.RU";\n' + '__get$(a, i)\n',

            unprocessable = '<!--\n' + 'dn="SIDEX.RU";\n // -->';

        check([{
            src:      src,
            expected: expected
        }, {
            src:      unprocessable,
            expected: unprocessable
        }], t);

        t.done();
    },

    'Health monitor - wrong js processing (kakaku.com)': function (t) {
        function getCodeFromFunc(func) {
            return func.toString().replace(/^function \w+\(\) {|}$/g, '');
        }

        function testCode () {
            <!--
            var rdm0 = '';
            var rdm1 = '';
            a[i];
            //-->
        }

        function expectedCode () {
            var rdm0 = '';
            var rdm1 = '';
            __get$(a, i)
        }

        check([{
            src:      getCodeFromFunc(testCode),
            expected: getCodeFromFunc(expectedCode)
        }], t);

        t.done();
    }
};

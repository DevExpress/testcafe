/*global js_beautify: true */
/*jshint */

function run_beautifier_tests(test_obj, Urlencoded, js_beautify, html_beautify, css_beautify)
{

    var opts = {
        indent_size: 4,
        indent_char: ' ',
        preserve_newlines: true,
        jslint_happy: false,
        keep_array_indentation: false,
        brace_style: 'collapse',
        space_before_conditional: true,
        break_chained_methods: false,
        selector_separator: '\n',
        end_with_newline: true
    };

    function test_js_beautifier(input)
    {
        return js_beautify(input, opts);
    }

    function test_html_beautifier(input)
    {
        return html_beautify(input, opts);
    }

    function test_css_beautifier(input)
    {
        return css_beautify(input, opts);
    }

    var sanitytest;

    // test the input on beautifier with the current flag settings
    // does not check the indentation / surroundings as bt() does
    function test_fragment(input, expected)
    {
        expected = expected || input;
        sanitytest.expect(input, expected);
        // if the expected is different from input, run it again
        // expected output should be unchanged when run twice.
        if (expected != input) {
            sanitytest.expect(expected, expected);
        }
    }



    // test the input on beautifier with the current flag settings
    // test both the input as well as { input } wrapping
    function bt(input, expectation)
    {
        var wrapped_input, wrapped_expectation;

        expectation = expectation || input;
        sanitytest.test_function(test_js_beautifier, 'js_beautify');
        test_fragment(input, expectation);

        // test also the returned indentation
        // e.g if input = "asdf();"
        // then test that this remains properly formatted as well:
        // {
        //     asdf();
        //     indent;
        // }

        if (opts.indent_size === 4 && input) {
            wrapped_input = '{\n' + input.replace(/^(.+)$/mg, '    $1') + '\n    foo = bar;\n}';
            wrapped_expectation = '{\n' + expectation.replace(/^(.+)$/mg, '    $1') + '\n    foo = bar;\n}';
            test_fragment(wrapped_input, wrapped_expectation);
        }

    }

    // test html
    function bth(input, expectation)
    {
        var wrapped_input, wrapped_expectation, field_input, field_expectation;

        expectation = expectation || input;
        sanitytest.test_function(test_html_beautifier, 'html_beautify');
        test_fragment(input, expectation);

        if (opts.indent_size === 4 && input) {
            wrapped_input = '<div>\n' + input.replace(/^(.+)$/mg, '    $1') + '\n    <span>inline</span>\n</div>';
            wrapped_expectation = '<div>\n' + expectation.replace(/^(.+)$/mg, '    $1') + '\n    <span>inline</span>\n</div>';
            test_fragment(wrapped_input, wrapped_expectation);
        }

        // Test that handlebars non-block {{}} tags act as content and do not
        // get any spacing or line breaks.
        if (input.indexOf('content') != -1) {
            // Just {{field}}
            field_input = input.replace(/content/g, '{{field}}');
            field_expectation = expectation.replace(/content/g, '{{field}}');
            test_fragment(field_input, field_expectation);

            // handlebars comment
            field_input = input.replace(/content/g, '{{! comment}}');
            field_expectation = expectation.replace(/content/g, '{{! comment}}');
            test_fragment(field_input, field_expectation);

            // mixed {{field}} and content
            field_input = input.replace(/content/g, 'pre{{field1}} {{field2}} {{field3}}post');
            field_expectation = expectation.replace(/content/g, 'pre{{field1}} {{field2}} {{field3}}post');
            test_fragment(field_input, field_expectation);
        }
    }

    // test css
    function btc(input, expectation)
    {
        var wrapped_input, wrapped_expectation;

        expectation = expectation || input;
        sanitytest.test_function(test_css_beautifier, 'css_beautify');
        test_fragment(input, expectation);
    }

    // test the input on beautifier with the current flag settings,
    // but dont't
    function bt_braces(input, expectation)
    {
        var braces_ex = opts.brace_style;
        opts.brace_style = 'expand';
        bt(input, expectation);
        opts.brace_style = braces_ex;
    }

    function beautifier_tests()
    {
        sanitytest = test_obj;

        opts.indent_size       = 4;
        opts.indent_char       = ' ';
        opts.preserve_newlines = true;
        opts.jslint_happy      = false;
        opts.keep_array_indentation = false;
        opts.brace_style       = "collapse";


        bt('');
        bt('return .5');
        test_fragment('   return .5');
        test_fragment('   return .5;\n   a();');
        bt('a        =          1', 'a = 1');
        bt('a=1', 'a = 1');
        bt("a();\n\nb();", "a();\n\nb();");
        bt('var a = 1 var b = 2', "var a = 1\nvar b = 2");
        bt('var a=1, b=c[d], e=6;', 'var a = 1,\n    b = c[d],\n    e = 6;');
        bt('var a,\n    b,\n    c;');
        bt('a = " 12345 "');
        bt("a = ' 12345 '");
        bt('if (a == 1) b = 2;', "if (a == 1) b = 2;");
        bt('if(1){2}else{3}', "if (1) {\n    2\n} else {\n    3\n}");
        bt('if(1||2);', 'if (1 || 2);');
        bt('(a==1)||(b==2)', '(a == 1) || (b == 2)');
        bt('var a = 1 if (2) 3;', "var a = 1\nif (2) 3;");
        bt('a = a + 1');
        bt('a = a == 1');
        bt('/12345[^678]*9+/.match(a)');
        bt('a /= 5');
        bt('a = 0.5 * 3');
        bt('a *= 10.55');
        bt('a < .5');
        bt('a <= .5');
        bt('a<.5', 'a < .5');
        bt('a<=.5', 'a <= .5');
        bt('a = 0xff;');
        bt('a=0xff+4', 'a = 0xff + 4');
        bt('a = [1, 2, 3, 4]');
        bt('F*(g/=f)*g+b', 'F * (g /= f) * g + b');
        bt('a.b({c:d})', 'a.b({\n    c: d\n})');
        bt('a.b\n(\n{\nc:\nd\n}\n)', 'a.b({\n    c: d\n})');
        bt('a.b({c:"d"})', 'a.b({\n    c: "d"\n})');
        bt('a.b\n(\n{\nc:\n"d"\n}\n)', 'a.b({\n    c: "d"\n})');
        bt('a=!b', 'a = !b');
        bt('a?b:c', 'a ? b : c');
        bt('a?1:2', 'a ? 1 : 2');
        bt('a?(b):c', 'a ? (b) : c');
        bt('x={a:1,b:w=="foo"?x:y,c:z}', 'x = {\n    a: 1,\n    b: w == "foo" ? x : y,\n    c: z\n}');
        bt('x=a?b?c?d:e:f:g;', 'x = a ? b ? c ? d : e : f : g;');
        bt('x=a?b?c?d:{e1:1,e2:2}:f:g;', 'x = a ? b ? c ? d : {\n    e1: 1,\n    e2: 2\n} : f : g;');
        bt('function void(void) {}');
        bt('if(!a)foo();', 'if (!a) foo();');
        bt('a=~a', 'a = ~a');
        bt('a;/*comment*/b;', "a; /*comment*/\nb;");
        bt('a;/* comment */b;', "a; /* comment */\nb;");
        test_fragment('a;/*\ncomment\n*/b;', "a;\n/*\ncomment\n*/\nb;"); // simple comments don't get touched at all
        bt('a;/**\n* javadoc\n*/b;', "a;\n/**\n * javadoc\n */\nb;");
        test_fragment('a;/**\n\nno javadoc\n*/b;', "a;\n/**\n\nno javadoc\n*/\nb;");
        bt('a;/*\n* javadoc\n*/b;', "a;\n/*\n * javadoc\n */\nb;"); // comment blocks detected and reindented even w/o javadoc starter
        bt('if(a)break;', "if (a) break;");
        bt('if(a){break}', "if (a) {\n    break\n}");
        bt('if((a))foo();', 'if ((a)) foo();');
        bt('for(var i=0;;) a', 'for (var i = 0;;) a');
        bt('for(var i=0;;)\na', 'for (var i = 0;;)\n    a');
        bt('a++;', 'a++;');
        bt('for(;;i++)a()', 'for (;; i++) a()');
        bt('for(;;i++)\na()', 'for (;; i++)\n    a()');
        bt('for(;;++i)a', 'for (;; ++i) a');
        bt('return(1)', 'return (1)');
        bt('try{a();}catch(b){c();}finally{d();}', "try {\n    a();\n} catch (b) {\n    c();\n} finally {\n    d();\n}");
        bt('(xx)()'); // magic function call
        bt('a[1]()'); // another magic function call
        bt('if(a){b();}else if(c) foo();', "if (a) {\n    b();\n} else if (c) foo();");
        bt('switch(x) {case 0: case 1: a(); break; default: break}', "switch (x) {\n    case 0:\n    case 1:\n        a();\n        break;\n    default:\n        break\n}");
        bt('switch(x){case -1:break;case !y:break;}', 'switch (x) {\n    case -1:\n        break;\n    case !y:\n        break;\n}');
        bt('a !== b');
        bt('if (a) b(); else c();', "if (a) b();\nelse c();");
        bt("// comment\n(function something() {})"); // typical greasemonkey start
        bt("{\n\n    x();\n\n}"); // was: duplicating newlines
        bt('if (a in b) foo();');
        bt('var a, b;');
        //  bt('var a, b');
        bt('{a:1, b:2}', "{\n    a: 1,\n    b: 2\n}");
        bt('a={1:[-1],2:[+1]}', 'a = {\n    1: [-1],\n    2: [+1]\n}');
        bt('var l = {\'a\':\'1\', \'b\':\'2\'}', "var l = {\n    'a': '1',\n    'b': '2'\n}");
        bt('if (template.user[n] in bk) foo();');
        bt('{{}/z/}', "{\n    {}\n    /z/\n}");
        bt('return 45', "return 45");
        bt('If[1]', "If[1]");
        bt('Then[1]', "Then[1]");
        bt('a = 1e10', "a = 1e10");
        bt('a = 1.3e10', "a = 1.3e10");
        bt('a = 1.3e-10', "a = 1.3e-10");
        bt('a = -1.3e-10', "a = -1.3e-10");
        bt('a = 1e-10', "a = 1e-10");
        bt('a = e - 10', "a = e - 10");
        bt('a = 11-10', "a = 11 - 10");
        bt("a = 1;// comment", "a = 1; // comment");
        bt("a = 1; // comment", "a = 1; // comment");
        bt("a = 1;\n // comment", "a = 1;\n// comment");
        bt('a = [-1, -1, -1]');

        // The exact formatting these should have is open for discussion, but they are at least reasonable
        bt('a = [ // comment\n    -1, -1, -1\n]');
        bt('var a = [ // comment\n    -1, -1, -1\n]');
        bt('a = [ // comment\n    -1, // comment\n    -1, -1\n]');
        bt('var a = [ // comment\n    -1, // comment\n    -1, -1\n]');

        bt('o = [{a:b},{c:d}]', 'o = [{\n    a: b\n}, {\n    c: d\n}]');

        bt("if (a) {\n    do();\n}"); // was: extra space appended

        bt("if (a) {\n// comment\n}else{\n// comment\n}", "if (a) {\n    // comment\n} else {\n    // comment\n}"); // if/else statement with empty body
        bt("if (a) {\n// comment\n// comment\n}", "if (a) {\n    // comment\n    // comment\n}"); // multiple comments indentation
        bt("if (a) b() else c();", "if (a) b()\nelse c();");
        bt("if (a) b() else if c() d();", "if (a) b()\nelse if c() d();");

        bt("{}");
        bt("{\n\n}");
        bt("do { a(); } while ( 1 );", "do {\n    a();\n} while (1);");
        bt("do {} while (1);");
        bt("do {\n} while (1);", "do {} while (1);");
        bt("do {\n\n} while (1);");
        bt("var a = x(a, b, c)");
        bt("delete x if (a) b();", "delete x\nif (a) b();");
        bt("delete x[x] if (a) b();", "delete x[x]\nif (a) b();");
        bt("for(var a=1,b=2)d", "for (var a = 1, b = 2) d");
        bt("for(var a=1,b=2,c=3) d", "for (var a = 1, b = 2, c = 3) d");
        bt("for(var a=1,b=2,c=3;d<3;d++)\ne", "for (var a = 1, b = 2, c = 3; d < 3; d++)\n    e");
        bt("function x(){(a||b).c()}", "function x() {\n    (a || b).c()\n}");
        bt("function x(){return - 1}", "function x() {\n    return -1\n}");
        bt("function x(){return ! a}", "function x() {\n    return !a\n}");

        // a common snippet in jQuery plugins
        bt("settings = $.extend({},defaults,settings);", "settings = $.extend({}, defaults, settings);");

        bt('{xxx;}()', '{\n    xxx;\n}()');

        bt("a = 'a'\nb = 'b'");
        bt("a = /reg/exp");
        bt("a = /reg/");
        bt('/abc/.test()');
        bt('/abc/i.test()');
        bt("{/abc/i.test()}", "{\n    /abc/i.test()\n}");
        bt('var x=(a)/a;', 'var x = (a) / a;');

        bt('x != -1', 'x != -1');

        bt('for (; s-->0;)t', 'for (; s-- > 0;) t');
        bt('for (; s++>0;)u', 'for (; s++ > 0;) u');
        bt('a = s++>s--;', 'a = s++ > s--;');
        bt('a = s++>--s;', 'a = s++ > --s;');

        bt('{x=#1=[]}', '{\n    x = #1=[]\n}');
        bt('{a:#1={}}', '{\n    a: #1={}\n}');
        bt('{a:#1#}', '{\n    a: #1#\n}');

        test_fragment('"incomplete-string');
        test_fragment("'incomplete-string");
        test_fragment('/incomplete-regex');

        test_fragment('{a:1},{a:2}', '{\n    a: 1\n}, {\n    a: 2\n}');
        test_fragment('var ary=[{a:1}, {a:2}];', 'var ary = [{\n    a: 1\n}, {\n    a: 2\n}];');

        test_fragment('{a:#1', '{\n    a: #1'); // incomplete
        test_fragment('{a:#', '{\n    a: #'); // incomplete

        test_fragment('}}}', '}\n}\n}'); // incomplete

        test_fragment('<!--\nvoid();\n// -->', '<!--\nvoid();\n// -->');

        test_fragment('a=/regexp', 'a = /regexp'); // incomplete regexp

        bt('{a:#1=[],b:#1#,c:#999999#}', '{\n    a: #1=[],\n    b: #1#,\n    c: #999999#\n}');

        bt("a = 1e+2");
        bt("a = 1e-2");
        bt("do{x()}while(a>1)", "do {\n    x()\n} while (a > 1)");

        bt("x(); /reg/exp.match(something)", "x();\n/reg/exp.match(something)");

        test_fragment("something();(", "something();\n(");
        test_fragment("#!she/bangs, she bangs\nf=1", "#!she/bangs, she bangs\n\nf = 1");
        test_fragment("#!she/bangs, she bangs\n\nf=1", "#!she/bangs, she bangs\n\nf = 1");
        test_fragment("#!she/bangs, she bangs\n\n/* comment */", "#!she/bangs, she bangs\n\n/* comment */");
        test_fragment("#!she/bangs, she bangs\n\n\n/* comment */", "#!she/bangs, she bangs\n\n\n/* comment */");
        test_fragment("#", "#");
        test_fragment("#!", "#!");

        bt("function namespace::something()");

        test_fragment("<!--\nsomething();\n-->", "<!--\nsomething();\n-->");
        test_fragment("<!--\nif(i<0){bla();}\n-->", "<!--\nif (i < 0) {\n    bla();\n}\n-->");

        bt('{foo();--bar;}', '{\n    foo();\n    --bar;\n}');
        bt('{foo();++bar;}', '{\n    foo();\n    ++bar;\n}');
        bt('{--bar;}', '{\n    --bar;\n}');
        bt('{++bar;}', '{\n    ++bar;\n}');

        // Handling of newlines around unary ++ and -- operators
        bt('{foo\n++bar;}', '{\n    foo\n    ++bar;\n}');
        bt('{foo++\nbar;}', '{\n    foo++\n    bar;\n}');

        // This is invalid, but harder to guard against. Issue #203.
        bt('{foo\n++\nbar;}', '{\n    foo\n    ++\n    bar;\n}');


        // regexps
        bt('a(/abc\\/\\/def/);b()', "a(/abc\\/\\/def/);\nb()");
        bt('a(/a[b\\[\\]c]d/);b()', "a(/a[b\\[\\]c]d/);\nb()");
        test_fragment('a(/a[b\\[', "a(/a[b\\["); // incomplete char class
        // allow unescaped / in char classes
        bt('a(/[a/b]/);b()', "a(/[a/b]/);\nb()");

        bt('a=[[1,2],[4,5],[7,8]]', "a = [\n    [1, 2],\n    [4, 5],\n    [7, 8]\n]");
        bt('a=[[1,2],[4,5],function(){},[7,8]]',
            "a = [\n    [1, 2],\n    [4, 5],\n    function() {},\n    [7, 8]\n]");
        bt('a=[[1,2],[4,5],function(){},function(){},[7,8]]',
            "a = [\n    [1, 2],\n    [4, 5],\n    function() {},\n    function() {},\n    [7, 8]\n]");
        bt('a=[[1,2],[4,5],function(){},[7,8]]',
            "a = [\n    [1, 2],\n    [4, 5],\n    function() {},\n    [7, 8]\n]");
        bt('a=[b,c,function(){},function(){},d]',
            "a = [b, c,\n    function() {},\n    function() {},\n    d\n]");
        bt('a=[a[1],b[4],c[d[7]]]', "a = [a[1], b[4], c[d[7]]]");
        bt('[1,2,[3,4,[5,6],7],8]', "[1, 2, [3, 4, [5, 6], 7], 8]");

        bt('[[["1","2"],["3","4"]],[["5","6","7"],["8","9","0"]],[["1","2","3"],["4","5","6","7"],["8","9","0"]]]',
            '[\n    [\n        ["1", "2"],\n        ["3", "4"]\n    ],\n    [\n        ["5", "6", "7"],\n        ["8", "9", "0"]\n    ],\n    [\n        ["1", "2", "3"],\n        ["4", "5", "6", "7"],\n        ["8", "9", "0"]\n    ]\n]');

        bt('{[x()[0]];indent;}', '{\n    [x()[0]];\n    indent;\n}');

        bt('return ++i', 'return ++i');
        bt('return !!x', 'return !!x');
        bt('return !x', 'return !x');
        bt('return [1,2]', 'return [1, 2]');
        bt('return;', 'return;');
        bt('return\nfunc', 'return\nfunc');
        bt('catch(e)', 'catch (e)');

        bt('var a=1,b={foo:2,bar:3},{baz:4,wham:5},c=4;',
            'var a = 1,\n    b = {\n        foo: 2,\n        bar: 3\n    }, {\n        baz: 4,\n        wham: 5\n    }, c = 4;');
        bt('var a=1,b={foo:2,bar:3},{baz:4,wham:5},\nc=4;',
            'var a = 1,\n    b = {\n        foo: 2,\n        bar: 3\n    }, {\n        baz: 4,\n        wham: 5\n    },\n    c = 4;');


        // inline comment
        bt('function x(/*int*/ start, /*string*/ foo)', 'function x( /*int*/ start, /*string*/ foo)');

        // javadoc comment
        bt('/**\n* foo\n*/', '/**\n * foo\n */');
        bt('{\n/**\n* foo\n*/\n}', '{\n    /**\n     * foo\n     */\n}');

        bt('var a,b,c=1,d,e,f=2;', 'var a, b, c = 1,\n    d, e, f = 2;');
        bt('var a,b,c=[],d,e,f=2;', 'var a, b, c = [],\n    d, e, f = 2;');

        bt('do/regexp/;\nwhile(1);', 'do /regexp/;\nwhile (1);'); // hmmm

        bt('var a = a,\na;\nb = {\nb\n}', 'var a = a,\n    a;\nb = {\n    b\n}');

        bt('var a = a,\n    /* c */\n    b;');
        bt('var a = a,\n    // c\n    b;');

        bt('foo.("bar");'); // weird element referencing


        bt('if (a) a()\nelse b()\nnewline()');
        bt('if (a) a()\nnewline()');
        bt('a=typeof(x)', 'a = typeof(x)');

        bt('var a = function() {\n    return null;\n},\n    b = false;');

        bt('var a = function() {\n    func1()\n}');
        bt('var a = function() {\n    func1()\n}\nvar b = function() {\n    func2()\n}');



        opts.jslint_happy = true;

        bt('a=typeof(x)', 'a = typeof (x)');
        bt('x();\n\nfunction(){}', 'x();\n\nfunction () {}');
        bt('function () {\n    var a, b, c, d, e = [],\n        f;\n}');
        bt('switch(x) {case 0: case 1: a(); break; default: break}',
            "switch (x) {\ncase 0:\ncase 1:\n    a();\n    break;\ndefault:\n    break\n}");
        bt('switch(x){case -1:break;case !y:break;}',
            'switch (x) {\ncase -1:\n    break;\ncase !y:\n    break;\n}');
        test_fragment("// comment 1\n(function()", "// comment 1\n(function ()"); // typical greasemonkey start
        bt('var o1=$.extend(a);function(){alert(x);}', 'var o1 = $.extend(a);\n\nfunction () {\n    alert(x);\n}');

        opts.jslint_happy = false;

        bt('switch(x) {case 0: case 1: a(); break; default: break}',
            "switch (x) {\n    case 0:\n    case 1:\n        a();\n        break;\n    default:\n        break\n}");
        bt('switch(x){case -1:break;case !y:break;}',
            'switch (x) {\n    case -1:\n        break;\n    case !y:\n        break;\n}');
        test_fragment("// comment 2\n(function()", "// comment 2\n(function()"); // typical greasemonkey start
        bt("var a2, b2, c2, d2 = 0, c = function() {}, d = '';", "var a2, b2, c2, d2 = 0,\n    c = function() {}, d = '';");
        bt("var a2, b2, c2, d2 = 0, c = function() {},\nd = '';", "var a2, b2, c2, d2 = 0,\n    c = function() {},\n    d = '';");
        bt('var o2=$.extend(a);function(){alert(x);}', 'var o2 = $.extend(a);\n\nfunction() {\n    alert(x);\n}');

        bt('{"x":[{"a":1,"b":3},7,8,8,8,8,{"b":99},{"a":11}]}', '{\n    "x": [{\n            "a": 1,\n            "b": 3\n        },\n        7, 8, 8, 8, 8, {\n            "b": 99\n        }, {\n            "a": 11\n        }\n    ]\n}');

        bt('{"1":{"1a":"1b"},"2"}', '{\n    "1": {\n        "1a": "1b"\n    },\n    "2"\n}');
        bt('{a:{a:b},c}', '{\n    a: {\n        a: b\n    },\n    c\n}');

        bt('{[y[a]];keep_indent;}', '{\n    [y[a]];\n    keep_indent;\n}');

        bt('if (x) {y} else { if (x) {y}}', 'if (x) {\n    y\n} else {\n    if (x) {\n        y\n    }\n}');

        bt('if (foo) one()\ntwo()\nthree()');
        bt('if (1 + foo() && bar(baz()) / 2) one()\ntwo()\nthree()');
        bt('if (1 + foo() && bar(baz()) / 2) one();\ntwo();\nthree();');

        opts.indent_size = 1;
        opts.indent_char = ' ';
        bt('{ one_char() }', "{\n one_char()\n}");

        bt('var a,b=1,c=2', 'var a, b = 1,\n c = 2');

        opts.indent_size = 4;
        opts.indent_char = ' ';
        bt('{ one_char() }', "{\n    one_char()\n}");

        opts.indent_size = 1;
        opts.indent_char = "\t";
        bt('{ one_char() }', "{\n\tone_char()\n}");
        bt('x = a ? b : c; x;', 'x = a ? b : c;\nx;');

        //set to something else than it should change to, but with tabs on, should override
        opts.indent_size = 5;
        opts.indent_char = ' ';
        opts.indent_with_tabs = true;

        bt('{ one_char() }', "{\n\tone_char()\n}");
        bt('x = a ? b : c; x;', 'x = a ? b : c;\nx;');

        opts.indent_size = 4;
        opts.indent_char = ' ';
        opts.indent_with_tabs = false;

        opts.preserve_newlines = false;

        bt('var\na=dont_preserve_newlines;', 'var a = dont_preserve_newlines;');

        // make sure the blank line between function definitions stays
        // even when preserve_newlines = false
        bt('function foo() {\n    return 1;\n}\n\nfunction foo() {\n    return 1;\n}');
        bt('function foo() {\n    return 1;\n}\nfunction foo() {\n    return 1;\n}',
           'function foo() {\n    return 1;\n}\n\nfunction foo() {\n    return 1;\n}'
          );
        bt('function foo() {\n    return 1;\n}\n\n\nfunction foo() {\n    return 1;\n}',
           'function foo() {\n    return 1;\n}\n\nfunction foo() {\n    return 1;\n}'
          );

        opts.preserve_newlines = true;
        bt('var\na=do_preserve_newlines;', 'var\na = do_preserve_newlines;');
        bt('// a\n// b\n\n// c\n// d');
        bt('if (foo) //  comment\n{\n    bar();\n}');


        opts.keep_array_indentation = false;
        bt("a = ['a', 'b', 'c',\n   'd', 'e', 'f']",
            "a = ['a', 'b', 'c',\n    'd', 'e', 'f'\n]");
        bt("a = ['a', 'b', 'c',\n   'd', 'e', 'f',\n        'g', 'h', 'i']",
            "a = ['a', 'b', 'c',\n    'd', 'e', 'f',\n    'g', 'h', 'i'\n]");
        bt("a = ['a', 'b', 'c',\n       'd', 'e', 'f',\n            'g', 'h', 'i']",
            "a = ['a', 'b', 'c',\n    'd', 'e', 'f',\n    'g', 'h', 'i'\n]");
        bt('var x = [{}\n]', 'var x = [{}]');
        bt('var x = [{foo:bar}\n]', 'var x = [{\n    foo: bar\n}]');
        bt("a = ['something',\n    'completely',\n    'different'];\nif (x);",
            "a = ['something',\n    'completely',\n    'different'\n];\nif (x);");
        bt("a = ['a','b','c']", "a = ['a', 'b', 'c']");

        bt("a = ['a',   'b','c']", "a = ['a', 'b', 'c']");
        bt("x = [{'a':0}]",
            "x = [{\n    'a': 0\n}]");
        bt('{a([[a1]], {b;});}',
            '{\n    a([\n        [a1]\n    ], {\n        b;\n    });\n}');
        bt("a();\n   [\n   ['sdfsdfsd'],\n        ['sdfsdfsdf']\n   ].toString();",
            "a();\n[\n    ['sdfsdfsd'],\n    ['sdfsdfsdf']\n].toString();");
        bt("function() {\n    Foo([\n        ['sdfsdfsd'],\n        ['sdfsdfsdf']\n    ]);\n}",
            "function() {\n    Foo([\n        ['sdfsdfsd'],\n        ['sdfsdfsdf']\n    ]);\n}");

        opts.keep_array_indentation = true;
        bt("a = ['a', 'b', 'c',\n   'd', 'e', 'f']");
        bt("a = ['a', 'b', 'c',\n   'd', 'e', 'f',\n        'g', 'h', 'i']");
        bt("a = ['a', 'b', 'c',\n       'd', 'e', 'f',\n            'g', 'h', 'i']");
        bt('var x = [{}\n]', 'var x = [{}\n]');
        bt('var x = [{foo:bar}\n]', 'var x = [{\n        foo: bar\n    }\n]');
        bt("a = ['something',\n    'completely',\n    'different'];\nif (x);");
        bt("a = ['a','b','c']", "a = ['a', 'b', 'c']");
        bt("a = ['a',   'b','c']", "a = ['a', 'b', 'c']");
        bt("x = [{'a':0}]",
            "x = [{\n    'a': 0\n}]");
        bt('{a([[a1]], {b;});}',
            '{\n    a([[a1]], {\n        b;\n    });\n}');
        bt("a();\n   [\n   ['sdfsdfsd'],\n        ['sdfsdfsdf']\n   ].toString();",
            "a();\n   [\n   ['sdfsdfsd'],\n        ['sdfsdfsdf']\n   ].toString();");
        bt("function() {\n    Foo([\n        ['sdfsdfsd'],\n        ['sdfsdfsdf']\n    ]);\n}",
            "function() {\n    Foo([\n        ['sdfsdfsd'],\n        ['sdfsdfsdf']\n    ]);\n}");

        opts.keep_array_indentation = false;


        bt('a = //comment\n/regex/;');

        test_fragment('/*\n * X\n */');
        test_fragment('/*\r\n * X\r\n */', '/*\n * X\n */');

        bt('if (a)\n{\nb;\n}\nelse\n{\nc;\n}', 'if (a) {\n    b;\n} else {\n    c;\n}');


        opts.brace_style = 'expand';

        bt('//case 1\nif (a == 1)\n{}\n//case 2\nelse if (a == 2)\n{}');
        bt('if(1){2}else{3}', "if (1)\n{\n    2\n}\nelse\n{\n    3\n}");
        bt('try{a();}catch(b){c();}catch(d){}finally{e();}',
            "try\n{\n    a();\n}\ncatch (b)\n{\n    c();\n}\ncatch (d)\n{}\nfinally\n{\n    e();\n}");
        bt('if(a){b();}else if(c) foo();',
            "if (a)\n{\n    b();\n}\nelse if (c) foo();");
        bt("if (a) {\n// comment\n}else{\n// comment\n}",
            "if (a)\n{\n    // comment\n}\nelse\n{\n    // comment\n}"); // if/else statement with empty body
        bt('if (x) {y} else { if (x) {y}}',
            'if (x)\n{\n    y\n}\nelse\n{\n    if (x)\n    {\n        y\n    }\n}');
        bt('if (a)\n{\nb;\n}\nelse\n{\nc;\n}',
            'if (a)\n{\n    b;\n}\nelse\n{\n    c;\n}');
        test_fragment('    /*\n* xx\n*/\n// xx\nif (foo) {\n    bar();\n}',
                      '    /*\n     * xx\n     */\n    // xx\n    if (foo)\n    {\n        bar();\n    }');
        bt('if (foo)\n{}\nelse /regex/.test();');
        bt('if (foo) /regex/.test();');
        bt('if (a)\n{\nb;\n}\nelse\n{\nc;\n}', 'if (a)\n{\n    b;\n}\nelse\n{\n    c;\n}');
        test_fragment('if (foo) {', 'if (foo)\n{');
        test_fragment('foo {', 'foo\n{');
        test_fragment('return {', 'return {'); // return needs the brace.
        test_fragment('return /* inline */ {', 'return /* inline */ {');
        // test_fragment('return\n{', 'return\n{'); // can't support this?, but that's an improbable and extreme case anyway.
        test_fragment('return;\n{', 'return;\n{');
        bt("throw {}");
        bt("throw {\n    foo;\n}");
        bt('var foo = {}');
        bt('if (foo) bar();\nelse break');
        bt('function x() {\n    foo();\n}zzz', 'function x()\n{\n    foo();\n}\nzzz');
        bt('a: do {} while (); xxx', 'a: do {} while ();\nxxx');
        bt('var a = new function();');
        bt('var a = new function() {};');
        bt('var a = new function a()\n    {};');
        test_fragment('new function');
        bt("foo({\n    'a': 1\n},\n10);",
            "foo(\n    {\n        'a': 1\n    },\n    10);");
        bt('(["foo","bar"]).each(function(i) {return i;});',
            '(["foo", "bar"]).each(function(i)\n{\n    return i;\n});');
        bt('(function(i) {return i;})();',
            '(function(i)\n{\n    return i;\n})();');
        bt( "test( /*Argument 1*/ {\n" +
            "    'Value1': '1'\n" +
            "}, /*Argument 2\n" +
            " */ {\n" +
            "    'Value2': '2'\n" +
            "});",
            // expected
            "test( /*Argument 1*/\n" +
            "    {\n" +
            "        'Value1': '1'\n" +
            "    },\n" +
            "    /*Argument 2\n" +
            "     */\n" +
            "    {\n" +
            "        'Value2': '2'\n" +
            "    });");
        bt( "test(\n" +
            "/*Argument 1*/ {\n" +
            "    'Value1': '1'\n" +
            "},\n" +
            "/*Argument 2\n" +
            " */ {\n" +
            "    'Value2': '2'\n" +
            "});",
            // expected
            "test(\n" +
            "    /*Argument 1*/\n" +
            "    {\n" +
            "        'Value1': '1'\n" +
            "    },\n" +
            "    /*Argument 2\n" +
            "     */\n" +
            "    {\n" +
            "        'Value2': '2'\n" +
            "    });");
        bt( "test( /*Argument 1*/\n" +
            "{\n" +
            "    'Value1': '1'\n" +
            "}, /*Argument 2\n" +
            " */\n" +
            "{\n" +
            "    'Value2': '2'\n" +
            "});",
            // expected
            "test( /*Argument 1*/\n" +
            "    {\n" +
            "        'Value1': '1'\n" +
            "    },\n" +
            "    /*Argument 2\n" +
            "     */\n" +
            "    {\n" +
            "        'Value2': '2'\n" +
            "    });");

        opts.brace_style = 'collapse';

        bt('//case 1\nif (a == 1) {}\n//case 2\nelse if (a == 2) {}');
        bt('if(1){2}else{3}', "if (1) {\n    2\n} else {\n    3\n}");
        bt('try{a();}catch(b){c();}catch(d){}finally{e();}',
             "try {\n    a();\n} catch (b) {\n    c();\n} catch (d) {} finally {\n    e();\n}");
        bt('if(a){b();}else if(c) foo();',
            "if (a) {\n    b();\n} else if (c) foo();");
        bt("if (a) {\n// comment\n}else{\n// comment\n}",
            "if (a) {\n    // comment\n} else {\n    // comment\n}"); // if/else statement with empty body
        bt('if (x) {y} else { if (x) {y}}',
            'if (x) {\n    y\n} else {\n    if (x) {\n        y\n    }\n}');
        bt('if (a)\n{\nb;\n}\nelse\n{\nc;\n}',
            'if (a) {\n    b;\n} else {\n    c;\n}');
        test_fragment('    /*\n* xx\n*/\n// xx\nif (foo) {\n    bar();\n}',
                      '    /*\n     * xx\n     */\n    // xx\n    if (foo) {\n        bar();\n    }');
        bt('if (foo) {} else /regex/.test();');
        bt('if (foo) /regex/.test();');
        bt('if (a)\n{\nb;\n}\nelse\n{\nc;\n}', 'if (a) {\n    b;\n} else {\n    c;\n}');
        test_fragment('if (foo) {', 'if (foo) {');
        test_fragment('foo {', 'foo {');
        test_fragment('return {', 'return {'); // return needs the brace.
        test_fragment('return /* inline */ {', 'return /* inline */ {');
        // test_fragment('return\n{', 'return\n{'); // can't support this?, but that's an improbable and extreme case anyway.
        test_fragment('return;\n{', 'return; {');
        bt("throw {}");
        bt("throw {\n    foo;\n}");
        bt('var foo = {}');
        bt('if (foo) bar();\nelse break');
        bt('function x() {\n    foo();\n}zzz', 'function x() {\n    foo();\n}\nzzz');
        bt('a: do {} while (); xxx', 'a: do {} while ();\nxxx');
        bt('var a = new function();');
        bt('var a = new function() {};');
        bt('var a = new function a() {};');
        test_fragment('new function');
        bt("foo({\n    'a': 1\n},\n10);",
            "foo({\n        'a': 1\n    },\n    10);");
        bt('(["foo","bar"]).each(function(i) {return i;});',
            '(["foo", "bar"]).each(function(i) {\n    return i;\n});');
        bt('(function(i) {return i;})();',
            '(function(i) {\n    return i;\n})();');
        bt( "test( /*Argument 1*/ {\n" +
            "    'Value1': '1'\n" +
            "}, /*Argument 2\n" +
            " */ {\n" +
            "    'Value2': '2'\n" +
            "});",
            // expected
            "test( /*Argument 1*/ {\n" +
            "        'Value1': '1'\n" +
            "    },\n" +
            "    /*Argument 2\n" +
            "     */\n" +
            "    {\n" +
            "        'Value2': '2'\n" +
            "    });");
        bt( "test(\n" +
            "/*Argument 1*/ {\n" +
            "    'Value1': '1'\n" +
            "},\n" +
            "/*Argument 2\n" +
            " */ {\n" +
            "    'Value2': '2'\n" +
            "});",
            // expected
            "test(\n" +
            "    /*Argument 1*/\n" +
            "    {\n" +
            "        'Value1': '1'\n" +
            "    },\n" +
            "    /*Argument 2\n" +
            "     */\n" +
            "    {\n" +
            "        'Value2': '2'\n" +
            "    });");
        bt( "test( /*Argument 1*/\n" +
            "{\n" +
            "    'Value1': '1'\n" +
            "}, /*Argument 2\n" +
            " */\n" +
            "{\n" +
            "    'Value2': '2'\n" +
            "});",
            // expected
            "test( /*Argument 1*/ {\n" +
            "        'Value1': '1'\n" +
            "    },\n" +
            "    /*Argument 2\n" +
            "     */\n" +
            "    {\n" +
            "        'Value2': '2'\n" +
            "    });");

        opts.brace_style = "end-expand";

        bt('//case 1\nif (a == 1) {}\n//case 2\nelse if (a == 2) {}');
        bt('if(1){2}else{3}', "if (1) {\n    2\n}\nelse {\n    3\n}");
        bt('try{a();}catch(b){c();}catch(d){}finally{e();}',
            "try {\n    a();\n}\ncatch (b) {\n    c();\n}\ncatch (d) {}\nfinally {\n    e();\n}");
        bt('if(a){b();}else if(c) foo();',
            "if (a) {\n    b();\n}\nelse if (c) foo();");
        bt("if (a) {\n// comment\n}else{\n// comment\n}",
            "if (a) {\n    // comment\n}\nelse {\n    // comment\n}"); // if/else statement with empty body
        bt('if (x) {y} else { if (x) {y}}',
            'if (x) {\n    y\n}\nelse {\n    if (x) {\n        y\n    }\n}');
        bt('if (a)\n{\nb;\n}\nelse\n{\nc;\n}',
            'if (a) {\n    b;\n}\nelse {\n    c;\n}');
        test_fragment('    /*\n* xx\n*/\n// xx\nif (foo) {\n    bar();\n}',
                      '    /*\n     * xx\n     */\n    // xx\n    if (foo) {\n        bar();\n    }');
        bt('if (foo) {}\nelse /regex/.test();');
        bt('if (foo) /regex/.test();');
        bt('if (a)\n{\nb;\n}\nelse\n{\nc;\n}', 'if (a) {\n    b;\n}\nelse {\n    c;\n}');
        test_fragment('if (foo) {', 'if (foo) {');
        test_fragment('foo {', 'foo {');
        test_fragment('return {', 'return {'); // return needs the brace.
        test_fragment('return /* inline */ {', 'return /* inline */ {');
        // test_fragment('return\n{', 'return\n{'); // can't support this?, but that's an improbable and extreme case anyway.
        test_fragment('return;\n{', 'return; {');
        bt("throw {}");
        bt("throw {\n    foo;\n}");
        bt('var foo = {}');
        bt('if (foo) bar();\nelse break');
        bt('function x() {\n    foo();\n}zzz', 'function x() {\n    foo();\n}\nzzz');
        bt('a: do {} while (); xxx', 'a: do {} while ();\nxxx');
        bt('var a = new function();');
        bt('var a = new function() {};');
        bt('var a = new function a() {};');
        test_fragment('new function');
        bt("foo({\n    'a': 1\n},\n10);",
            "foo({\n        'a': 1\n    },\n    10);");
        bt('(["foo","bar"]).each(function(i) {return i;});',
            '(["foo", "bar"]).each(function(i) {\n    return i;\n});');
        bt('(function(i) {return i;})();',
            '(function(i) {\n    return i;\n})();');
        bt( "test( /*Argument 1*/ {\n" +
            "    'Value1': '1'\n" +
            "}, /*Argument 2\n" +
            " */ {\n" +
            "    'Value2': '2'\n" +
            "});",
            // expected
            "test( /*Argument 1*/ {\n" +
            "        'Value1': '1'\n" +
            "    },\n" +
            "    /*Argument 2\n" +
            "     */\n" +
            "    {\n" +
            "        'Value2': '2'\n" +
            "    });");
        bt( "test(\n" +
            "/*Argument 1*/ {\n" +
            "    'Value1': '1'\n" +
            "},\n" +
            "/*Argument 2\n" +
            " */ {\n" +
            "    'Value2': '2'\n" +
            "});",
            // expected
            "test(\n" +
            "    /*Argument 1*/\n" +
            "    {\n" +
            "        'Value1': '1'\n" +
            "    },\n" +
            "    /*Argument 2\n" +
            "     */\n" +
            "    {\n" +
            "        'Value2': '2'\n" +
            "    });");
        bt( "test( /*Argument 1*/\n" +
            "{\n" +
            "    'Value1': '1'\n" +
            "}, /*Argument 2\n" +
            " */\n" +
            "{\n" +
            "    'Value2': '2'\n" +
            "});",
            // expected
            "test( /*Argument 1*/ {\n" +
            "        'Value1': '1'\n" +
            "    },\n" +
            "    /*Argument 2\n" +
            "     */\n" +
            "    {\n" +
            "        'Value2': '2'\n" +
            "    });");

        opts.brace_style = 'collapse';


        bt('a = <?= external() ?> ;'); // not the most perfect thing in the world, but you're the weirdo beaufifying php mix-ins with javascript beautifier
        bt('a = <%= external() %> ;');

        bt('// func-comment\n\nfunction foo() {}\n\n// end-func-comment');

        test_fragment('roo = {\n    /*\n    ****\n      FOO\n    ****\n    */\n    BAR: 0\n};');

        bt('"foo""bar""baz"', '"foo"\n"bar"\n"baz"');
        bt("'foo''bar''baz'", "'foo'\n'bar'\n'baz'");


        test_fragment("if (zz) {\n    // ....\n}\n(function");

        bt("{\n    get foo() {}\n}");
        bt("{\n    var a = get\n    foo();\n}");
        bt("{\n    set foo() {}\n}");
        bt("{\n    var a = set\n    foo();\n}");
        bt("var x = {\n    get function()\n}");
        bt("var x = {\n    set function()\n}");
        bt("var x = set\n\nfunction() {}", "var x = set\n\n    function() {}");

        bt('<!-- foo\nbar();\n-->');
        bt('<!-- dont crash');
        bt('for () /abc/.test()');
        bt('if (k) /aaa/m.test(v) && l();');
        bt('switch (true) {\n    case /swf/i.test(foo):\n        bar();\n}');
        bt('createdAt = {\n    type: Date,\n    default: Date.now\n}');
        bt('switch (createdAt) {\n    case a:\n        Date,\n    default:\n        Date.now\n}');
        opts.space_before_conditional = false;
        bt('if(a) b()');
        opts.space_before_conditional = true;


        opts.preserve_newlines = true;
        bt('var a = 42; // foo\n\nvar b;');
        bt('var a = 42; // foo\n\n\nvar b;');
        bt("var a = 'foo' +\n    'bar';");
        bt("var a = \"foo\" +\n    \"bar\";");
        bt('this.oa = new OAuth(\n' +
           '    _requestToken,\n' +
           '    _accessToken,\n' +
           '    consumer_key\n' +
           ');');


        opts.unescape_strings = false;
        test_fragment('"\\x22\\x27", \'\\x22\\x27\', "\\x5c", \'\\x5c\', "\\xff and \\xzz", "unicode \\u0000 \\u0022 \\u0027 \\u005c \\uffff \\uzzzz"');
        opts.unescape_strings = true;
        test_fragment('"\\x20\\x40\\x4a"', '" @J"');
        test_fragment('"\\xff\\x40\\x4a"');
        test_fragment('"\\u0072\\u016B\\u0137\\u012B\\u0074\\u0069\\u0073"', '"rūķītis"');
        test_fragment('"Google Chrome est\\u00E1 actualizado."', '"Google Chrome está actualizado."');
        /*
        bt('"\\x22\\x27",\'\\x22\\x27\',"\\x5c",\'\\x5c\',"\\xff and \\xzz","unicode \\u0000 \\u0022 \\u0027 \\u005c \\uffff \\uzzzz"',
           '"\\"\'", \'"\\\'\', "\\\\", \'\\\\\', "\\xff and \\xzz", "unicode \\u0000 \\" \' \\\\ \\uffff \\uzzzz"');
        */
        opts.unescape_strings = false;

        bt('return function();');
        bt('var a = function();');
        bt('var a = 5 + function();');

        bt('3.*7;', '3. * 7;');
        bt('import foo.*;', 'import foo.*;'); // actionscript's import
        test_fragment('function f(a: a, b: b)'); // actionscript

        bt('{\n    foo // something\n    ,\n    bar // something\n    baz\n}');
        bt('function a(a) {} function b(b) {} function c(c) {}', 'function a(a) {}\n\nfunction b(b) {}\n\nfunction c(c) {}');
        bt('foo(a, function() {})');

        bt('foo(a, /regex/)');

        bt('/* foo */\n"x"');

        opts.break_chained_methods = false;
        opts.preserve_newlines = false;
        bt('foo\n.bar()\n.baz().cucumber(fat)', 'foo.bar().baz().cucumber(fat)');
        bt('foo\n.bar()\n.baz().cucumber(fat); foo.bar().baz().cucumber(fat)', 'foo.bar().baz().cucumber(fat);\nfoo.bar().baz().cucumber(fat)');
        bt('foo\n.bar()\n.baz().cucumber(fat)\n foo.bar().baz().cucumber(fat)', 'foo.bar().baz().cucumber(fat)\nfoo.bar().baz().cucumber(fat)');
        bt('this\n.something = foo.bar()\n.baz().cucumber(fat)', 'this.something = foo.bar().baz().cucumber(fat)');
        bt('this.something.xxx = foo.moo.bar()');
        bt('this\n.something\n.xxx = foo.moo\n.bar()', 'this.something.xxx = foo.moo.bar()');

        opts.break_chained_methods = false;
        opts.preserve_newlines = true;
        bt('foo\n.bar()\n.baz().cucumber(fat)', 'foo\n    .bar()\n    .baz().cucumber(fat)');
        bt('foo\n.bar()\n.baz().cucumber(fat); foo.bar().baz().cucumber(fat)', 'foo\n    .bar()\n    .baz().cucumber(fat);\nfoo.bar().baz().cucumber(fat)');
        bt('foo\n.bar()\n.baz().cucumber(fat)\n foo.bar().baz().cucumber(fat)', 'foo\n    .bar()\n    .baz().cucumber(fat)\nfoo.bar().baz().cucumber(fat)');
        bt('this\n.something = foo.bar()\n.baz().cucumber(fat)', 'this\n    .something = foo.bar()\n    .baz().cucumber(fat)');
        bt('this.something.xxx = foo.moo.bar()');
        bt('this\n.something\n.xxx = foo.moo\n.bar()', 'this\n    .something\n    .xxx = foo.moo\n    .bar()');

        opts.break_chained_methods = true;
        opts.preserve_newlines = false;
        bt('foo\n.bar()\n.baz().cucumber(fat)', 'foo.bar()\n    .baz()\n    .cucumber(fat)');
        bt('foo\n.bar()\n.baz().cucumber(fat); foo.bar().baz().cucumber(fat)', 'foo.bar()\n    .baz()\n    .cucumber(fat);\nfoo.bar()\n    .baz()\n    .cucumber(fat)');
        bt('foo\n.bar()\n.baz().cucumber(fat)\n foo.bar().baz().cucumber(fat)', 'foo.bar()\n    .baz()\n    .cucumber(fat)\nfoo.bar()\n    .baz()\n    .cucumber(fat)');
        bt('this\n.something = foo.bar()\n.baz().cucumber(fat)', 'this.something = foo.bar()\n    .baz()\n    .cucumber(fat)');
        bt('this.something.xxx = foo.moo.bar()');
        bt('this\n.something\n.xxx = foo.moo\n.bar()', 'this.something.xxx = foo.moo.bar()');

        opts.break_chained_methods = true;
        opts.preserve_newlines = true;
        bt('foo\n.bar()\n.baz().cucumber(fat)', 'foo\n    .bar()\n    .baz()\n    .cucumber(fat)');
        bt('foo\n.bar()\n.baz().cucumber(fat); foo.bar().baz().cucumber(fat)', 'foo\n    .bar()\n    .baz()\n    .cucumber(fat);\nfoo.bar()\n    .baz()\n    .cucumber(fat)');
        bt('foo\n.bar()\n.baz().cucumber(fat)\n foo.bar().baz().cucumber(fat)', 'foo\n    .bar()\n    .baz()\n    .cucumber(fat)\nfoo.bar()\n    .baz()\n    .cucumber(fat)');
        bt('this\n.something = foo.bar()\n.baz().cucumber(fat)', 'this\n    .something = foo.bar()\n    .baz()\n    .cucumber(fat)');
        bt('this.something.xxx = foo.moo.bar()');
        bt('this\n.something\n.xxx = foo.moo\n.bar()', 'this\n    .something\n    .xxx = foo.moo\n    .bar()');

        opts.break_chained_methods = false;

        opts.preserve_newlines = false;
        opts.wrap_line_length = 0;
        //.............---------1---------2---------3---------4---------5---------6---------7
        //.............1234567890123456789012345678901234567890123456789012345678901234567890
        test_fragment('foo.bar().baz().cucumber((fat && "sassy") || (leans\n&& mean));\n' +
                      'Test_very_long_variable_name_this_should_never_wrap\n.but_this_can\n' +
                      'if (wraps_can_occur && inside_an_if_block) that_is_\n.okay();\n' +
                      'object_literal = {\n' +
                      '    property: first_token_should_never_wrap + but_this_can,\n' +
                      '    proper: "first_token_should_never_wrap" + "but_this_can"\n' +
                      '}',
                      /* expected */
                      'foo.bar().baz().cucumber((fat && "sassy") || (leans && mean));\n' +
                      'Test_very_long_variable_name_this_should_never_wrap.but_this_can\n' +
                      'if (wraps_can_occur && inside_an_if_block) that_is_.okay();\n' +
                      'object_literal = {\n' +
                      '    property: first_token_should_never_wrap + but_this_can,\n' +
                      '    proper: "first_token_should_never_wrap" + "but_this_can"\n' +
                      '}');

        opts.wrap_line_length = 70;
        //.............---------1---------2---------3---------4---------5---------6---------7
        //.............1234567890123456789012345678901234567890123456789012345678901234567890
        test_fragment('foo.bar().baz().cucumber((fat && "sassy") || (leans\n&& mean));\n' +
                      'Test_very_long_variable_name_this_should_never_wrap\n.but_this_can\n' +
                      'if (wraps_can_occur && inside_an_if_block) that_is_\n.okay();\n' +
                      'object_literal = {\n' +
                      '    property: first_token_should_never_wrap + but_this_can,\n' +
                      '    proper: "first_token_should_never_wrap" + "but_this_can"\n' +
                      '}',
                      /* expected */
                      'foo.bar().baz().cucumber((fat && "sassy") || (leans && mean));\n' +
                      'Test_very_long_variable_name_this_should_never_wrap.but_this_can\n' +
                      'if (wraps_can_occur && inside_an_if_block) that_is_.okay();\n' +
                      'object_literal = {\n' +
                      '    property: first_token_should_never_wrap + but_this_can,\n' +
                      '    proper: "first_token_should_never_wrap" + "but_this_can"\n' +
                      '}');

        opts.wrap_line_length = 40;
        //.............---------1---------2---------3---------4---------5---------6---------7
        //.............1234567890123456789012345678901234567890123456789012345678901234567890
        test_fragment('foo.bar().baz().cucumber((fat && "sassy") || (leans\n&& mean));\n' +
                      'Test_very_long_variable_name_this_should_never_wrap\n.but_this_can\n' +
                      'if (wraps_can_occur && inside_an_if_block) that_is_\n.okay();\n' +
                      'object_literal = {\n' +
                      '    property: first_token_should_never_wrap + but_this_can,\n' +
                      '    proper: "first_token_should_never_wrap" + "but_this_can"\n' +
                      '}',
                      /* expected */
                      'foo.bar().baz().cucumber((fat &&\n' +
                      '    "sassy") || (leans && mean));\n' +
                      'Test_very_long_variable_name_this_should_never_wrap\n' +
                      '    .but_this_can\n' +
                      'if (wraps_can_occur &&\n' +
                      '    inside_an_if_block) that_is_.okay();\n' +
                      'object_literal = {\n' +
                      '    property: first_token_should_never_wrap +\n' +
                      '        but_this_can,\n' +
                      '    proper: "first_token_should_never_wrap" +\n' +
                      '        "but_this_can"\n' +
                      '}');

        opts.wrap_line_length = 41;
        // NOTE: wrap is only best effort - line continues until next wrap point is found.
        //.............---------1---------2---------3---------4---------5---------6---------7
        //.............1234567890123456789012345678901234567890123456789012345678901234567890
        test_fragment('foo.bar().baz().cucumber((fat && "sassy") || (leans\n&& mean));\n' +
                      'Test_very_long_variable_name_this_should_never_wrap\n.but_this_can\n' +
                      'if (wraps_can_occur && inside_an_if_block) that_is_\n.okay();\n' +
                      'object_literal = {\n' +
                      '    property: first_token_should_never_wrap + but_this_can,\n' +
                      '    proper: "first_token_should_never_wrap" + "but_this_can"\n' +
                      '}',
                      /* expected */
                      'foo.bar().baz().cucumber((fat && "sassy") ||\n' +
                      '    (leans && mean));\n' +
                      'Test_very_long_variable_name_this_should_never_wrap\n' +
                      '    .but_this_can\n' +
                      'if (wraps_can_occur &&\n' +
                      '    inside_an_if_block) that_is_.okay();\n' +
                      'object_literal = {\n' +
                      '    property: first_token_should_never_wrap +\n' +
                      '        but_this_can,\n' +
                      '    proper: "first_token_should_never_wrap" +\n' +
                      '        "but_this_can"\n' +
                      '}');

        opts.wrap_line_length = 45;
        // NOTE: wrap is only best effort - line continues until next wrap point is found.
        //.............---------1---------2---------3---------4---------5---------6---------7
        //.............1234567890123456789012345678901234567890123456789012345678901234567890
        test_fragment('{\n' +
                      '    foo.bar().baz().cucumber((fat && "sassy") || (leans\n&& mean));\n' +
                      '    Test_very_long_variable_name_this_should_never_wrap\n.but_this_can\n' +
                      '    if (wraps_can_occur && inside_an_if_block) that_is_\n.okay();\n' +
                      '    object_literal = {\n' +
                      '        property: first_token_should_never_wrap + but_this_can,\n' +
                      '        proper: "first_token_should_never_wrap" + "but_this_can"\n' +
                      '    }' +
                      '}',
                      /* expected */
                      '{\n' +
                      '    foo.bar().baz().cucumber((fat && "sassy") ||\n' +
                      '        (leans && mean));\n' +
                      '    Test_very_long_variable_name_this_should_never_wrap\n' +
                      '        .but_this_can\n' +
                      '    if (wraps_can_occur &&\n' +
                      '        inside_an_if_block) that_is_.okay();\n' +
                      '    object_literal = {\n' +
                      '        property: first_token_should_never_wrap +\n' +
                      '            but_this_can,\n' +
                      '        proper: "first_token_should_never_wrap" +\n' +
                      '            "but_this_can"\n' +
                      '    }\n'+
                      '}');

        opts.preserve_newlines = true;
        opts.wrap_line_length = 0;
        //.............---------1---------2---------3---------4---------5---------6---------7
        //.............1234567890123456789012345678901234567890123456789012345678901234567890
        test_fragment('foo.bar().baz().cucumber((fat && "sassy") || (leans\n&& mean));\n' +
                      'Test_very_long_variable_name_this_should_never_wrap\n.but_this_can\n' +
                      'if (wraps_can_occur && inside_an_if_block) that_is_\n.okay();\n' +
                      'object_literal = {\n' +
                      '    property: first_token_should_never_wrap + but_this_can,\n' +
                      '    proper: "first_token_should_never_wrap" + "but_this_can"\n' +
                      '}',
                      /* expected */
                      'foo.bar().baz().cucumber((fat && "sassy") || (leans && mean));\n' +
                      'Test_very_long_variable_name_this_should_never_wrap\n' +
                      '    .but_this_can\n' +
                      'if (wraps_can_occur && inside_an_if_block) that_is_\n' +
                      '    .okay();\n' +
                      'object_literal = {\n' +
                      '    property: first_token_should_never_wrap + but_this_can,\n' +
                      '    proper: "first_token_should_never_wrap" + "but_this_can"\n' +
                      '}');

        opts.wrap_line_length = 70;
        //.............---------1---------2---------3---------4---------5---------6---------7
        //.............1234567890123456789012345678901234567890123456789012345678901234567890
        test_fragment('foo.bar().baz().cucumber((fat && "sassy") || (leans\n&& mean));\n' +
                      'Test_very_long_variable_name_this_should_never_wrap\n.but_this_can\n' +
                      'if (wraps_can_occur && inside_an_if_block) that_is_\n.okay();\n' +
                      'object_literal = {\n' +
                      '    property: first_token_should_never_wrap + but_this_can,\n' +
                      '    proper: "first_token_should_never_wrap" + "but_this_can"\n' +
                      '}',
                      /* expected */
                      'foo.bar().baz().cucumber((fat && "sassy") || (leans && mean));\n' +
                      'Test_very_long_variable_name_this_should_never_wrap\n' +
                      '    .but_this_can\n' +
                      'if (wraps_can_occur && inside_an_if_block) that_is_\n' +
                      '    .okay();\n' +
                      'object_literal = {\n' +
                      '    property: first_token_should_never_wrap + but_this_can,\n' +
                      '    proper: "first_token_should_never_wrap" + "but_this_can"\n' +
                      '}');


        opts.wrap_line_length = 40;
        //.............---------1---------2---------3---------4---------5---------6---------7
        //.............1234567890123456789012345678901234567890123456789012345678901234567890
        test_fragment('foo.bar().baz().cucumber((fat && "sassy") || (leans\n&& mean));\n' +
                      'Test_very_long_variable_name_this_should_never_wrap\n.but_this_can\n' +
                      'if (wraps_can_occur && inside_an_if_block) that_is_\n.okay();\n' +
                      'object_literal = {\n' +
                      '    property: first_token_should_never_wrap + but_this_can,\n' +
                      '    proper: "first_token_should_never_wrap" + "but_this_can"\n' +
                      '}',
                      /* expected */
                      'foo.bar().baz().cucumber((fat &&\n' +
                      '    "sassy") || (leans && mean));\n' +
                      'Test_very_long_variable_name_this_should_never_wrap\n' +
                      '    .but_this_can\n' +
                      'if (wraps_can_occur &&\n' +
                      '    inside_an_if_block) that_is_\n' +
                      '    .okay();\n' +
                      'object_literal = {\n' +
                      '    property: first_token_should_never_wrap +\n' +
                      '        but_this_can,\n' +
                      '    proper: "first_token_should_never_wrap" +\n' +
                      '        "but_this_can"\n' +
                      '}');

        opts.wrap_line_length = 41;
        // NOTE: wrap is only best effort - line continues until next wrap point is found.
        //.............---------1---------2---------3---------4---------5---------6---------7
        //.............1234567890123456789012345678901234567890123456789012345678901234567890
        test_fragment('foo.bar().baz().cucumber((fat && "sassy") || (leans\n&& mean));\n' +
                      'Test_very_long_variable_name_this_should_never_wrap\n.but_this_can\n' +
                      'if (wraps_can_occur && inside_an_if_block) that_is_\n.okay();\n' +
                      'object_literal = {\n' +
                      '    property: first_token_should_never_wrap + but_this_can,\n' +
                      '    proper: "first_token_should_never_wrap" + "but_this_can"\n' +
                      '}',
                      /* expected */
                      'foo.bar().baz().cucumber((fat && "sassy") ||\n' +
                      '    (leans && mean));\n' +
                      'Test_very_long_variable_name_this_should_never_wrap\n' +
                      '    .but_this_can\n' +
                      'if (wraps_can_occur &&\n' +
                      '    inside_an_if_block) that_is_\n' +
                      '    .okay();\n' +
                      'object_literal = {\n' +
                      '    property: first_token_should_never_wrap +\n' +
                      '        but_this_can,\n' +
                      '    proper: "first_token_should_never_wrap" +\n' +
                      '        "but_this_can"\n' +
                      '}');

        opts.wrap_line_length = 45;
        // NOTE: wrap is only best effort - line continues until next wrap point is found.
        //.............---------1---------2---------3---------4---------5---------6---------7
        //.............1234567890123456789012345678901234567890123456789012345678901234567890
        test_fragment('{\n' +
                      '    foo.bar().baz().cucumber((fat && "sassy") || (leans\n&& mean));\n' +
                      '    Test_very_long_variable_name_this_should_never_wrap\n.but_this_can\n' +
                      '    if (wraps_can_occur && inside_an_if_block) that_is_\n.okay();\n' +
                      '    object_literal = {\n' +
                      '        property: first_token_should_never_wrap + but_this_can,\n' +
                      '        proper: "first_token_should_never_wrap" + "but_this_can"\n' +
                      '    }' +
                      '}',
                      /* expected */
                      '{\n' +
                      '    foo.bar().baz().cucumber((fat && "sassy") ||\n' +
                      '        (leans && mean));\n' +
                      '    Test_very_long_variable_name_this_should_never_wrap\n' +
                      '        .but_this_can\n' +
                      '    if (wraps_can_occur &&\n' +
                      '        inside_an_if_block) that_is_\n' +
                      '        .okay();\n' +
                      '    object_literal = {\n' +
                      '        property: first_token_should_never_wrap +\n' +
                      '            but_this_can,\n' +
                      '        proper: "first_token_should_never_wrap" +\n' +
                      '            "but_this_can"\n' +
                      '    }\n'+
                      '}');

        opts.wrap_line_length = 0;

        opts.preserve_newlines = false;
        bt('if (foo) // comment\n    bar();');
        bt('if (foo) // comment\n    (bar());');
        bt('if (foo) // comment\n    (bar());');
        bt('if (foo) // comment\n    /asdf/;');
        bt('this.oa = new OAuth(\n' +
           '    _requestToken,\n' +
           '    _accessToken,\n' +
           '    consumer_key\n' +
           ');',
           'this.oa = new OAuth(_requestToken, _accessToken, consumer_key);');
        bt('foo = {\n    x: y, // #44\n    w: z // #44\n}');
        bt('switch (x) {\n    case "a":\n        // comment on newline\n        break;\n    case "b": // comment on same line\n        break;\n}');

        // these aren't ready yet.
        //bt('if (foo) // comment\n    bar() /*i*/ + baz() /*j\n*/ + asdf();');
        bt('if\n(foo)\nif\n(bar)\nif\n(baz)\nwhee();\na();',
            'if (foo)\n    if (bar)\n        if (baz) whee();\na();');
        bt('if\n(foo)\nif\n(bar)\nif\n(baz)\nwhee();\nelse\na();',
            'if (foo)\n    if (bar)\n        if (baz) whee();\n        else a();');
        bt('if (foo)\nbar();\nelse\ncar();',
            'if (foo) bar();\nelse car();');

        bt('if (foo) if (bar) if (baz);\na();',
            'if (foo)\n    if (bar)\n        if (baz);\na();');
        bt('if (foo) if (bar) if (baz) whee();\na();',
            'if (foo)\n    if (bar)\n        if (baz) whee();\na();');
        bt('if (foo) a()\nif (bar) if (baz) whee();\na();',
            'if (foo) a()\nif (bar)\n    if (baz) whee();\na();');
        bt('if (foo);\nif (bar) if (baz) whee();\na();',
            'if (foo);\nif (bar)\n    if (baz) whee();\na();');
        bt('if (options)\n' +
           '    for (var p in options)\n' +
           '        this[p] = options[p];',
           'if (options)\n'+
           '    for (var p in options) this[p] = options[p];');
        bt('if (options) for (var p in options) this[p] = options[p];',
           'if (options)\n    for (var p in options) this[p] = options[p];');

        bt('if (options) do q(); while (b());',
           'if (options)\n    do q(); while (b());');
        bt('if (options) while (b()) q();',
           'if (options)\n    while (b()) q();');
        bt('if (options) do while (b()) q(); while (a());',
           'if (options)\n    do\n        while (b()) q(); while (a());');

        bt('function f(a, b, c,\nd, e) {}',
            'function f(a, b, c, d, e) {}');

        bt('function f(a,b) {if(a) b()}function g(a,b) {if(!a) b()}',
            'function f(a, b) {\n    if (a) b()\n}\n\nfunction g(a, b) {\n    if (!a) b()\n}');
        bt('function f(a,b) {if(a) b()}\n\n\n\nfunction g(a,b) {if(!a) b()}',
            'function f(a, b) {\n    if (a) b()\n}\n\nfunction g(a, b) {\n    if (!a) b()\n}');

        // This is not valid syntax, but still want to behave reasonably and not side-effect
        bt('(if(a) b())(if(a) b())',
            '(\n    if (a) b())(\n    if (a) b())');
        bt('(if(a) b())\n\n\n(if(a) b())',
            '(\n    if (a) b())\n(\n    if (a) b())');



        bt("if\n(a)\nb();", "if (a) b();");
        bt('var a =\nfoo', 'var a = foo');
        bt('var a = {\n"a":1,\n"b":2}', "var a = {\n    \"a\": 1,\n    \"b\": 2\n}");
        bt("var a = {\n'a':1,\n'b':2}", "var a = {\n    'a': 1,\n    'b': 2\n}");
        bt('var a = /*i*/ "b";');
        bt('var a = /*i*/\n"b";', 'var a = /*i*/ "b";');
        bt('var a = /*i*/\nb;', 'var a = /*i*/ b;');
        bt('{\n\n\n"x"\n}', '{\n    "x"\n}');
        bt('if(a &&\nb\n||\nc\n||d\n&&\ne) e = f', 'if (a && b || c || d && e) e = f');
        bt('if(a &&\n(b\n||\nc\n||d)\n&&\ne) e = f', 'if (a && (b || c || d) && e) e = f');
        test_fragment('\n\n"x"', '"x"');
        bt('a = 1;\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\nb = 2;',
                'a = 1;\nb = 2;');

        opts.preserve_newlines = true;
        bt('if (foo) // comment\n    bar();');
        bt('if (foo) // comment\n    (bar());');
        bt('if (foo) // comment\n    (bar());');
        bt('if (foo) // comment\n    /asdf/;');
        bt('foo = {\n    x: y, // #44\n    w: z // #44\n}');
        bt('switch (x) {\n    case "a":\n        // comment on newline\n        break;\n    case "b": // comment on same line\n        break;\n}');

        // these aren't ready yet.
        // bt('if (foo) // comment\n    bar() /*i*/ + baz() /*j\n*/ + asdf();');
        bt('if\n(foo)\nif\n(bar)\nif\n(baz)\nwhee();\na();',
            'if (foo)\n    if (bar)\n        if (baz)\n            whee();\na();');
        bt('if\n(foo)\nif\n(bar)\nif\n(baz)\nwhee();\nelse\na();',
            'if (foo)\n    if (bar)\n        if (baz)\n            whee();\n        else\n            a();');
        bt('if (foo) bar();\nelse\ncar();',
            'if (foo) bar();\nelse\n    car();');

        bt('if (foo) if (bar) if (baz);\na();',
            'if (foo)\n    if (bar)\n        if (baz);\na();');
        bt('if (foo) if (bar) if (baz) whee();\na();',
            'if (foo)\n    if (bar)\n        if (baz) whee();\na();');
        bt('if (foo) a()\nif (bar) if (baz) whee();\na();',
            'if (foo) a()\nif (bar)\n    if (baz) whee();\na();');
        bt('if (foo);\nif (bar) if (baz) whee();\na();',
            'if (foo);\nif (bar)\n    if (baz) whee();\na();');
        bt('if (options)\n' +
           '    for (var p in options)\n' +
           '        this[p] = options[p];');
        bt('if (options) for (var p in options) this[p] = options[p];',
           'if (options)\n    for (var p in options) this[p] = options[p];');

        bt('if (options) do q(); while (b());',
           'if (options)\n    do q(); while (b());');
        bt('if (options) do; while (b());',
           'if (options)\n    do; while (b());');
        bt('if (options) while (b()) q();',
           'if (options)\n    while (b()) q();');
        bt('if (options) do while (b()) q(); while (a());',
           'if (options)\n    do\n        while (b()) q(); while (a());');

        bt('function f(a, b, c,\nd, e) {}',
            'function f(a, b, c,\n    d, e) {}');

        bt('function f(a,b) {if(a) b()}function g(a,b) {if(!a) b()}',
            'function f(a, b) {\n    if (a) b()\n}\n\nfunction g(a, b) {\n    if (!a) b()\n}');
        bt('function f(a,b) {if(a) b()}\n\n\n\nfunction g(a,b) {if(!a) b()}',
            'function f(a, b) {\n    if (a) b()\n}\n\n\n\nfunction g(a, b) {\n    if (!a) b()\n}');
        // This is not valid syntax, but still want to behave reasonably and not side-effect
        bt('(if(a) b())(if(a) b())',
            '(\n    if (a) b())(\n    if (a) b())');
        bt('(if(a) b())\n\n\n(if(a) b())',
            '(\n    if (a) b())\n\n\n(\n    if (a) b())');

        // space between functions
        bt('/*\n * foo\n */\nfunction foo() {}');
        bt('// a nice function\nfunction foo() {}');
        bt('function foo() {}\nfunction foo() {}',
            'function foo() {}\n\nfunction foo() {}'
        );



        bt("if\n(a)\nb();", "if (a)\n    b();");
        bt('var a =\nfoo', 'var a =\n    foo');
        bt('var a = {\n"a":1,\n"b":2}', "var a = {\n    \"a\": 1,\n    \"b\": 2\n}");
        bt("var a = {\n'a':1,\n'b':2}", "var a = {\n    'a': 1,\n    'b': 2\n}");
        bt('var a = /*i*/ "b";');
        bt('var a = /*i*/\n"b";', 'var a = /*i*/\n    "b";');
        bt('var a = /*i*/\nb;', 'var a = /*i*/\n    b;');
        bt('{\n\n\n"x"\n}', '{\n\n\n    "x"\n}');
        bt('if(a &&\nb\n||\nc\n||d\n&&\ne) e = f', 'if (a &&\n    b ||\n    c || d &&\n    e) e = f');
        bt('if(a &&\n(b\n||\nc\n||d)\n&&\ne) e = f', 'if (a &&\n    (b ||\n        c || d) &&\n    e) e = f');
        test_fragment('\n\n"x"', '"x"');

        // this beavior differs between js and python, defaults to unlimited in js, 10 in python
        bt('a = 1;\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\nb = 2;',
            'a = 1;\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\nb = 2;');
        opts.max_preserve_newlines = 8;
        bt('a = 1;\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\nb = 2;',
            'a = 1;\n\n\n\n\n\n\n\nb = 2;');

        // Test the option to have spaces within parens
        opts.space_in_paren = false;
        bt('if(p) foo(a,b)', 'if (p) foo(a, b)');
        bt('try{while(true){willThrow()}}catch(result)switch(result){case 1:++result }',
           'try {\n    while (true) {\n        willThrow()\n    }\n} catch (result) switch (result) {\n    case 1:\n        ++result\n}');
        bt('((e/((a+(b)*c)-d))^2)*5;', '((e / ((a + (b) * c) - d)) ^ 2) * 5;');
        bt('function f(a,b) {if(a) b()}function g(a,b) {if(!a) b()}',
            'function f(a, b) {\n    if (a) b()\n}\n\nfunction g(a, b) {\n    if (!a) b()\n}');
        bt('a=[];',
            'a = [];');
        bt('a=[b,c,d];',
            'a = [b, c, d];');
        bt('a= f[b];',
            'a = f[b];');
        opts.space_in_paren = true
        bt('if(p) foo(a,b)', 'if ( p ) foo( a, b )');
        bt('try{while(true){willThrow()}}catch(result)switch(result){case 1:++result }',
           'try {\n    while ( true ) {\n        willThrow()\n    }\n} catch ( result ) switch ( result ) {\n    case 1:\n        ++result\n}');
        bt('((e/((a+(b)*c)-d))^2)*5;', '( ( e / ( ( a + ( b ) * c ) - d ) ) ^ 2 ) * 5;');
        bt('function f(a,b) {if(a) b()}function g(a,b) {if(!a) b()}',
            'function f( a, b ) {\n    if ( a ) b()\n}\n\nfunction g( a, b ) {\n    if ( !a ) b()\n}');
        bt('a=[];',
            'a = [];');
        bt('a=[b,c,d];',
            'a = [ b, c, d ];');
        bt('a= f[b];',
            'a = f[ b ];');
        opts.space_in_paren = false;

        // Test that e4x literals passed through when e4x-option is enabled
        bt('xml=<a b="c"><d/><e>\n foo</e>x</a>;', 'xml = < a b = "c" > < d / > < e >\n    foo < /e>x</a > ;');
        opts.e4x = true;
        bt('xml=<a b="c"><d/><e>\n foo</e>x</a>;', 'xml = <a b="c"><d/><e>\n foo</e>x</a>;');
        bt('<a b=\'This is a quoted "c".\'/>', '<a b=\'This is a quoted "c".\'/>');
        bt('<a b="This is a quoted \'c\'."/>', '<a b="This is a quoted \'c\'."/>');
        bt('<a b="A quote \' inside string."/>', '<a b="A quote \' inside string."/>');
        bt('<a b=\'A quote " inside string.\'/>', '<a b=\'A quote " inside string.\'/>');
        bt('<a b=\'Some """ quotes ""  inside string.\'/>', '<a b=\'Some """ quotes ""  inside string.\'/>');
        // Handles inline expressions
        bt('xml=<{a} b="c"><d/><e v={z}>\n foo</e>x</{a}>;', 'xml = <{a} b="c"><d/><e v={z}>\n foo</e>x</{a}>;');
        // xml literals with special characters in elem names
        // see http://www.w3.org/TR/REC-xml/#NT-NameChar
        bt('xml = <_:.valid.xml- _:.valid.xml-="123"/>;', 'xml = <_:.valid.xml- _:.valid.xml-="123"/>;');
        // Handles CDATA
        bt('xml=<![CDATA[ b="c"><d/><e v={z}>\n foo</e>x/]]>;', 'xml = <![CDATA[ b="c"><d/><e v={z}>\n foo</e>x/]]>;');
        bt('xml=<![CDATA[]]>;', 'xml = <![CDATA[]]>;');
        bt('xml=<a b="c"><![CDATA[d/></a></{}]]></a>;', 'xml = <a b="c"><![CDATA[d/></a></{}]]></a>;');

        // Handles messed up tags, as long as it isn't the same name
        // as the root tag. Also handles tags of same name as root tag
        // as long as nesting matches.
        bt('xml=<a x="jn"><c></b></f><a><d jnj="jnn"><f></a ></nj></a>;',
         'xml = <a x="jn"><c></b></f><a><d jnj="jnn"><f></a ></nj></a>;');
        // If xml is not terminated, the remainder of the file is treated
        // as part of the xml-literal (passed through unaltered)
        test_fragment('xml=<a></b>\nc<b;', 'xml = <a></b>\nc<b;');
        opts.e4x = false;

        // START tests for issue 241
        bt('obj\n' +
           '    .last({\n' +
           '        foo: 1,\n' +
           '        bar: 2\n' +
           '    });\n' +
           'var test = 1;');

        bt('obj\n' +
           '    .last(a, function() {\n' +
           '        var test;\n' +
           '    });\n' +
           'var test = 1;');

        bt('obj.first()\n' +
           '    .second()\n' +
           '    .last(function(err, response) {\n' +
           '        console.log(err);\n' +
           '    });');

        // END tests for issue 241


        // START tests for issue 268 and 275
        bt('obj.last(a, function() {\n' +
           '    var test;\n' +
           '});\n' +
           'var test = 1;');
        bt('obj.last(a,\n' +
           '    function() {\n' +
           '        var test;\n' +
           '    });\n' +
           'var test = 1;');

        bt('(function() {if (!window.FOO) window.FOO || (window.FOO = function() {var b = {bar: "zort"};});})();',
           '(function() {\n' +
           '    if (!window.FOO) window.FOO || (window.FOO = function() {\n' +
           '        var b = {\n' +
           '            bar: "zort"\n' +
           '        };\n' +
           '    });\n' +
           '})();');
        // END tests for issue 268 and 275

        // START tests for issue 281
        bt('define(["dojo/_base/declare", "my/Employee", "dijit/form/Button",\n' +
           '    "dojo/_base/lang", "dojo/Deferred"\n' +
           '], function(declare, Employee, Button, lang, Deferred) {\n' +
           '    return declare(Employee, {\n' +
           '        constructor: function() {\n' +
           '            new Button({\n' +
           '                onClick: lang.hitch(this, function() {\n' +
           '                    new Deferred().then(lang.hitch(this, function() {\n' +
           '                        this.salary * 0.25;\n' +
           '                    }));\n' +
           '                })\n' +
           '            });\n' +
           '        }\n' +
           '    });\n' +
           '});');

        bt('define(["dojo/_base/declare", "my/Employee", "dijit/form/Button",\n' +
           '        "dojo/_base/lang", "dojo/Deferred"\n' +
           '    ],\n' +
           '    function(declare, Employee, Button, lang, Deferred) {\n' +
           '        return declare(Employee, {\n' +
           '            constructor: function() {\n' +
           '                new Button({\n' +
           '                    onClick: lang.hitch(this, function() {\n' +
           '                        new Deferred().then(lang.hitch(this, function() {\n' +
           '                            this.salary * 0.25;\n' +
           '                        }));\n' +
           '                    })\n' +
           '                });\n' +
           '            }\n' +
           '        });\n' +
           '    });');
        // END tests for issue 281

        // This is what I think these should look like related #256
        // we don't have the ability yet
//         bt('var a=1,b={bang:2},c=3;',
//             'var a = 1,\n    b = {\n        bang: 2\n    },\n     c = 3;');
//         bt('var a={bing:1},b=2,c=3;',
//             'var a = {\n        bing: 1\n    },\n    b = 2,\n    c = 3;');
        Urlencoded.run_tests(sanitytest);

        bth('');
        bth('<div></div>');
        bth('<div>content</div>');
        bth('<div><div></div></div>',
            '<div>\n' +
            '    <div></div>\n' +
            '</div>');
        bth('<div><div>content</div></div>',
            '<div>\n' +
            '    <div>content</div>\n' +
            '</div>');
        bth('<div>\n' +
            '    <span>content</span>\n' +
            '</div>');
        bth('<div>\n' +
            '</div>');
        bth('<div>\n' +
            '    content\n' +
            '</div>');
        bth('<div>\n' +
            '    </div>',
            '<div>\n' +
            '</div>');
        bth('    <div>\n' +
            '    </div>',
            '<div>\n' +
            '</div>');
        bth('    <div>\n' +
            '</div>',
            '<div>\n' +
            '</div>');
        bth('<div        >content</div>',
            '<div>content</div>');
        bth('<div     thinger="preserve  space  here"   ></div  >',
            '<div thinger="preserve  space  here"></div>');
        bth('content\n' +
            '    <div>\n' +
            '    </div>\n' +
            'content',
            'content\n' +
            '<div>\n' +
            '</div>\n' +
            'content');
        bth('<li>\n' +
            '    <div>\n' +
            '    </div>\n' +
            '</li>');
        bth('<li>\n' +
            '<div>\n' +
            '</div>\n' +
            '</li>',
            '<li>\n' +
            '    <div>\n' +
            '    </div>\n' +
            '</li>');
        bth('<li>\n' +
            '    content\n' +
            '</li>\n' +
            '<li>\n' +
            '    content\n' +
            '</li>');

        // Tests that don't pass, but probably should.
        // bth('<div><span>content</span></div>');

        // Handlebars tests
        // Without the indent option on, handlebars are treated as content.
        opts.indent_handlebars = false;
        bth('{{#if 0}}\n' +
            '    <div>\n' +
            '    </div>\n' +
            '{{/if}}',
            '{{#if 0}}\n' +
            '<div>\n' +
            '</div>\n' +
            '{{/if}}');
        bth('<div>\n' +
            '{{#each thing}}\n' +
            '    {{name}}\n' +
            '{{/each}}\n' +
            '</div>',
            '<div>\n' +
            '    {{#each thing}} {{name}} {{/each}}\n' +
            '</div>');

        opts.indent_handlebars = true;
        bth('{{#if 0}}{{/if}}');
        bth('{{#if 0}}content{{/if}}');
        bth('{{#if 0}}\n' +
            '{{/if}}');
        bth('{{#if     words}}{{/if}}',
            '{{#if words}}{{/if}}');
        bth('{{#if     words}}content{{/if}}',
            '{{#if words}}content{{/if}}');
        bth('{{#if     words}}content{{/if}}',
            '{{#if words}}content{{/if}}');
        bth('{{#if 1}}\n' +
            '    <div>\n' +
            '    </div>\n' +
            '{{/if}}');
        bth('{{#if 1}}\n' +
            '<div>\n' +
            '</div>\n' +
            '{{/if}}',
            '{{#if 1}}\n' +
            '    <div>\n' +
            '    </div>\n' +
            '{{/if}}');
        bth('<div>\n' +
            '    {{#if 1}}\n' +
            '    {{/if}}\n' +
            '</div>');
        bth('<div>\n' +
            '{{#if 1}}\n' +
            '{{/if}}\n' +
            '</div>',
            '<div>\n' +
            '    {{#if 1}}\n' +
            '    {{/if}}\n' +
            '</div>');
        bth('{{#if}}\n' +
            '{{#each}}\n' +
            '{{#if}}\n' +
            'content\n' +
            '{{/if}}\n' +
            '{{#if}}\n' +
            'content\n' +
            '{{/if}}\n' +
            '{{/each}}\n' +
            '{{/if}}',
            '{{#if}}\n' +
            '    {{#each}}\n' +
            '        {{#if}}\n' +
            '            content\n' +
            '        {{/if}}\n' +
            '        {{#if}}\n' +
            '            content\n' +
            '        {{/if}}\n' +
            '    {{/each}}\n' +
            '{{/if}}');
        bth('{{#if 1}}\n' +
            '    <div>\n' +
            '    </div>\n' +
            '{{/if}}');

        // Test {{else}} aligned with {{#if}} and {{/if}}
        bth('{{#if 1}}\n' +
            '    content\n' +
            '    {{else}}\n' +
            '    content\n' +
            '{{/if}}',
            '{{#if 1}}\n' +
            '    content\n' +
            '{{else}}\n' +
            '    content\n' +
            '{{/if}}');
        bth('{{#if 1}}\n' +
            '    {{else}}\n' +
            '    {{/if}}',
            '{{#if 1}}\n' +
            '{{else}}\n' +
            '{{/if}}');
        bth('{{#if thing}}\n' +
            '{{#if otherthing}}\n' +
            '    content\n' +
            '    {{else}}\n' +
            'content\n' +
            '    {{/if}}\n' +
            '       {{else}}\n'+
            'content\n' +
            '{{/if}}',
            '{{#if thing}}\n' +
            '    {{#if otherthing}}\n' +
            '        content\n' +
            '    {{else}}\n' +
            '        content\n' +
            '    {{/if}}\n' +
            '{{else}}\n'+
            '    content\n' +
            '{{/if}}');

        // Test {{}} inside of <> tags, which should be separated by spaces
        // for readability, unless they are inside a string.
        bth('<div{{somestyle}}></div>',
            '<div {{somestyle}}></div>');
        bth('<div{{#if test}}class="foo"{{/if}}>content</div>',
            '<div {{#if test}} class="foo" {{/if}}>content</div>');
        bth('<div{{#if thing}}{{somestyle}}class="{{class}}"{{else}}class="{{class2}}"{{/if}}>content</div>',
            '<div {{#if thing}} {{somestyle}} class="{{class}}" {{else}} class="{{class2}}" {{/if}}>content</div>');
        bth('<span{{#if condition}}class="foo"{{/if}}>content</span>',
            '<span {{#if condition}} class="foo" {{/if}}>content</span>');
        bth('<div unformatted="{{#if}}content{{/if}}">content</div>');
        bth('<div unformatted="{{#if  }}    content{{/if}}">content</div>');

        // Quotes found inside of Handlebars expressions inside of quoted
        // strings themselves should not be considered string delimiters.
        bth('<div class="{{#if thingIs "value"}}content{{/if}}"></div>');
        bth('<div class="{{#if thingIs \'value\'}}content{{/if}}"></div>');
        bth('<div class=\'{{#if thingIs "value"}}content{{/if}}\'></div>');
        bth('<div class=\'{{#if thingIs \'value\'}}content{{/if}}\'></div>');


        opts.wrap_line_length = 0;
        //...---------1---------2---------3---------4---------5---------6---------7
        //...1234567890123456789012345678901234567890123456789012345678901234567890
        bth('<div>Some test text that should wrap_inside_this section here.</div>',
            /* expected */
            '<div>Some test text that should wrap_inside_this section here.</div>');

        opts.wrap_line_length = "0";
        //...---------1---------2---------3---------4---------5---------6---------7
        //...1234567890123456789012345678901234567890123456789012345678901234567890
        bth('<div>Some test text that should wrap_inside_this section here.</div>',
            /* expected */
            '<div>Some test text that should wrap_inside_this section here.</div>');

        //BUGBUG: This should wrap before 40 not after.
        opts.wrap_line_length = 40;
        //...---------1---------2---------3---------4---------5---------6---------7
        //...1234567890123456789012345678901234567890123456789012345678901234567890
        bth('<div>Some test text that should wrap_inside_this section here.</div>',
            /* expected */
            '<div>Some test text that should wrap_inside_this\n' +
            '    section here.</div>');

       opts.wrap_line_length = "40";
        //...---------1---------2---------3---------4---------5---------6---------7
        //...1234567890123456789012345678901234567890123456789012345678901234567890
        bth('<div>Some test text that should wrap_inside_this section here.</div>',
            /* expected */
            '<div>Some test text that should wrap_inside_this\n' +
            '    section here.</div>');

        // css beautifier
        opts.indent_size = 1;
        opts.indent_char = '\t';
        opts.selector_separator_newline = true;
        opts.end_with_newline = true;

        // test basic css beautifier
        btc('', '\n');
        btc(".tabs{}", ".tabs {}\n");
        btc(".tabs{color:red;}", ".tabs {\n\tcolor: red;\n}\n");
        btc(".tabs{color:rgb(255, 255, 0)}", ".tabs {\n\tcolor: rgb(255, 255, 0)\n}\n");
        btc(".tabs{background:url('back.jpg')}", ".tabs {\n\tbackground: url('back.jpg')\n}\n");
        btc("#bla, #foo{color:red}", "#bla,\n#foo {\n\tcolor: red\n}\n");
        btc("@media print {.tab{}}", "@media print {\n\t.tab {}\n}\n");

        // comments
        btc("/* test */", "/* test */\n");
        btc(".tabs{/* test */}", ".tabs {\n\t/* test */\n}\n");
        btc("/* header */.tabs {}", "/* header */\n\n.tabs {}\n");

        // separate selectors
        btc("#bla, #foo{color:red}", "#bla,\n#foo {\n\tcolor: red\n}\n");
        btc("a, img {padding: 0.2px}", "a,\nimg {\n\tpadding: 0.2px\n}\n");

        // test options
        opts.indent_size = 2;
        opts.indent_char = ' ';
        opts.selector_separator_newline = false;

        btc("#bla, #foo{color:green}", "#bla, #foo {\n  color: green\n}\n");
        btc("@media print {.tab{}}", "@media print {\n  .tab {}\n}\n");
        btc("#bla, #foo{color:black}", "#bla, #foo {\n  color: black\n}\n");

        return sanitytest;
    }

    return beautifier_tests();
}

if (typeof exports !== "undefined") {
    exports.run_beautifier_tests = run_beautifier_tests;
}

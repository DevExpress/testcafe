var expect                        = require('chai').expect;
var fs                            = require('fs');
var path                          = require('path');
var assign                        = require('lodash').assign;
var getTestList                   = require('../../lib/embedding-utils').getTestList;
var getTypeScriptTestList         = require('../../lib/embedding-utils').getTypeScriptTestList;
var getTestListFromCode           = require('../../lib/embedding-utils').getTestListFromCode;
var getTypeScriptTestListFromCode = require('../../lib/embedding-utils').getTypeScriptTestListFromCode;
var Promise                       = require('pinkie');
var parserBase                    = require('../../lib/compiler/test-file/test-file-parser-base');

var Test    = parserBase.Test;
var Fixture = function (name, start, end, loc, tests) {
    return assign(
        new parserBase.Fixture(name, start, end, loc),
        { tests: tests }
    );
};

function Loc (lineStart, columnStart, lineEnd, columnEnd) {
    this.start = { column: columnStart, line: lineStart };
    this.end   = { column: columnEnd, line: lineEnd };
}

function testFixtureParser (dir, expectedStructure, fileParser, codeParser) {
    var dirPath  = path.join(__dirname, dir);
    var fileList = fs.readdirSync(dirPath).sort();

    var parseFilePromises = fileList.map(function (filename, index) {
        var expected    = expectedStructure[index];
        var filePath    = path.join(dirPath, filename);
        var fileContent = fs.readFileSync(filePath, 'utf8');

        return fileParser(filePath)
            .then(function (structure) {
                expect(structure).eql(expected);
                expect(codeParser(fileContent)).eql(expected);
            });
    });

    return Promise.all(parseFilePromises);
}

function testJSFilesParser (dir, expectedStructure) {
    return Promise.all([
        testFixtureParser(dir, expectedStructure, getTestList, getTestListFromCode),
        testFixtureParser(dir, expectedStructure, getTypeScriptTestList, getTypeScriptTestListFromCode)
    ]);
}

function testTypeScriptFilesParser (dir, expectedStructure) {
    return testFixtureParser(dir, expectedStructure, getTypeScriptTestList, getTypeScriptTestListFromCode);
}

describe('Should get structure of files (esnext and typescript common cases)', function () {
    it('Base', function () {
        var expectedStructure = [
            [],
            [],
            [
                new Fixture('Fixture1', 30, 49, new Loc(3, 0, 3, 19),
                    [
                        new Test('Fixture1Test1', 52, 148, new Loc(5, 0, 9, 2)),
                        new Test('<computed name>(line: 13)', 187, 238, new Loc(13, 0, 15, 2))
                    ]
                ),

                new Fixture('<computed name>(line: 17)', 241, 353, new Loc(17, 0, 20, 26),
                    [
                        new Test('Fixture2Test1', 356, 413, new Loc(22, 0, 24, 2))
                    ]
                )],
            [
                new Fixture('Fixture3', 30, 136, new Loc(3, 0, 6, 27),
                    [
                        new Test('<computed name>(line: 10)', 178, 271, new Loc(10, 0, 14, 2))
                    ]
                )
            ]
        ];

        return testJSFilesParser('./data/test-suites/basic', expectedStructure);
    });

    it('Fixture name is not a string', function () {
        var expectedStructure = [[
            new Fixture('Yo', 173, 185, new Loc(5, 0, 5, 12),
                [
                    new Test('Test', 214, 254, new Loc(9, 0, 11, 2))
                ]
            )
        ]];

        return testJSFilesParser('./data/test-suites/fixture-name-is-not-a-string', expectedStructure);
    });

    it('Test name is not a string', function () {
        var expectedStructure = [
            [
                new Fixture('Test name is not a string', 0, 35, new Loc(1, 0, 1, 35),
                    [
                        new Test('TheAnswer', 210, 238, new Loc(6, 0, 7, 2))
                    ]
                )
            ]];

        return testJSFilesParser('./data/test-suites/test-name-is-not-a-string', expectedStructure);
    });

    it('Call from async function', function () {
        var expectedStructure = [
            [
                new Fixture('fixture 1', 0, 20, new Loc(1, 0, 1, 20),
                    [
                        new Test('test 1', 466, 480, new Loc(38, 0, 38, 14))
                    ]
                )]
        ];

        return testJSFilesParser('./data/test-suites/call-fixture-from-async-function', expectedStructure);
    });

    it('Hooks in test file', function () {
        var expectedStructure = [
            [
                new Fixture('fixture1', 0, 23, new Loc(1, 0, 1, 23),
                    [
                        new Test('fixture1test1', 26, 111, new Loc(3, 0, 9, 2))
                    ]
                ),

                new Fixture('fixture2', 115, 137, new Loc(12, 0, 12, 22),
                    [
                        new Test('fixture2test1', 140, 164, new Loc(14, 0, 14, 24)),
                        new Test('fixture2test2', 166, 190, new Loc(15, 0, 15, 24)),
                        new Test('fixture2test3', 193, 241, new Loc(17, 0, 17, 48)),
                        new Test('fixture2test4', 243, 269, new Loc(18, 0, 18, 26))
                    ]
                ),

                new Fixture('fixture 3', 272, 297, new Loc(20, 0, 20, 25),
                    [
                        new Test('fixture3test1', 300, 348, new Loc(22, 0, 22, 48)),
                        new Test('fixture3test2', 350, 376, new Loc(23, 0, 23, 26)),
                        new Test('fixture3test4', 379, 468, new Loc(25, 0, 32, 6))
                    ]
                ),

                new Fixture('fixture4', 472, 554, new Loc(35, 0, 38, 16),
                    [
                        new Test('fixture4test1', 557, 636, new Loc(40, 0, 43, 21))
                    ]
                ),

                new Fixture('fixture5', 639, 721, new Loc(45, 0, 48, 16),
                    [
                        new Test('fixture5test1', 724, 801, new Loc(50, 0, 53, 19))
                    ]
                ),

                new Fixture('fixture6', 804, 912, new Loc(55, 0, 59, 25),
                    [
                        new Test('fixture6test1', 915, 1026, new Loc(61, 0, 65, 31))
                    ]
                ),

                new Fixture('fixture7', 1029, 1137, new Loc(67, 0, 71, 25),
                    [
                        new Test('fixture7test1', 1140, 1251, new Loc(73, 0, 77, 31))
                    ]
                ),

                new Fixture('fixture8', 1254, 1360, new Loc(79, 0, 83, 25),
                    [
                        new Test('<computed name>(line: 88)', 1363, 1467, new Loc(85, 0, 89, 31))
                    ]
                )
            ]
        ];

        return testJSFilesParser('./data/test-suites/fixture-and-test-hooks', expectedStructure);
    });

    it('Tests and fixtures definitions in IIFE', function () {
        var expectedStructure = [[
            new Fixture('fixture', 19, 59, new Loc(2, 4, 2, 44),
                [
                    new Test('testName', 83, 158, new Loc(5, 8, 7, 10))
                ]
            )
        ]];

        return testJSFilesParser('./data/test-suites/tests-fixtures-in-iife', expectedStructure);
    });

    it('Hooks in test file - invalid usage', function () {
        var expectedStructure = [[]];

        return testJSFilesParser('./data/test-suites/fixture-and-test-hooks-invalid-usage', expectedStructure);
    });
});


describe('Should get structure of typescript files', function () {
    it('Smoke test', () => {
        var expectedStructure = [
            [
                new Fixture('fixture 1', 72, 132, new Loc(5, 0, 5, 60),
                    [
                        new Test('test 1', 246, 325, new Loc(9, 0, 11, 2))
                    ]
                ),

                new Fixture('<computed name>(line: 14)', 380, 422, new Loc(14, 1, 14, 43),
                    [
                        new Test('<computed name>(line: 15)', 425, 456, new Loc(15, 1, 16, 3))
                    ]
                )
            ],

            [
                new Fixture('fixture 1', 97, 138, new Loc(9, 9, 9, 50),
                    [
                        new Test('test 1', 147, 222, new Loc(11, 6, 13, 12))
                    ]
                )
            ]
        ];

        return testTypeScriptFilesParser('./data/test-suites/typescript-parser-smoke', expectedStructure);
    });
});

describe('Regression', function () {
    it('Parser fails with "JS allocation failed" error (GH-1771)', function () {
        var expectedStructure = [[
            new Fixture('Fixture', 93, 135, new Loc(5, 0, 6, 24), [
                new Test('Test', 138, 167, new Loc(8, 0, 10, 2))
            ])
        ]];

        return testJSFilesParser('./data/test-suites/regression-gh-1771', expectedStructure);
    });
});

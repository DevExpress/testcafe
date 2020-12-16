const { expect } = require('chai');
const fs         = require('fs');
const path       = require('path');
const { assign } = require('lodash');

const {
    getTestList,
    getTypeScriptTestList,
    getTestListFromCode,
    getTypeScriptTestListFromCode,
    getCoffeeScriptTestList,
    getCoffeeScriptTestListFromCode
} = require('../../lib/embedding-utils');

const parserBase = require('../../lib/compiler/test-file/test-file-parser-base');

const Test    = parserBase.Test;
const Fixture = function (name, start, end, loc, meta, tests) {
    return assign(
        new parserBase.Fixture(name, start, end, loc, meta),
        { tests: tests }
    );
};

function Loc (lineStart, columnStart, lineEnd, columnEnd) {
    this.start = { column: columnStart, line: lineStart };
    this.end   = { column: columnEnd, line: lineEnd };
}

function testFixtureParser (dir, expectedStructure, fileParser, codeParser) {
    const dirPath  = path.join(__dirname, dir);
    const fileList = fs.readdirSync(dirPath).sort();

    const parseFilePromises = fileList.map(function (filename, index) {
        const expected    = expectedStructure[index];
        const filePath    = path.join(dirPath, filename);
        const fileContent = fs.readFileSync(filePath, 'utf8');

        return fileParser(filePath)
            .then(function (structure) {
                expect(structure).eql(expected);
                expect(codeParser(fileContent)).eql(expected);

                Object.values(structure).forEach(fixture => {
                    expect(fixture.loc).not.undefined;

                    fixture.tests.forEach(test => {
                        expect(test.loc).not.undefined;
                    });
                });
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

function testCoffeeScriptFilesParser (dir, expectedStructure) {
    return testFixtureParser(dir, expectedStructure, getCoffeeScriptTestList, getCoffeeScriptTestListFromCode);
}

describe('Should get structure of files (esnext and typescript common cases)', function () {
    it('Base', function () {
        const expectedStructure = [
            [],
            [],
            [
                new Fixture('Fixture1', 30, 49, new Loc(3, 0, 3, 19), {},
                    [
                        new Test('Fixture1Test1', 52, 148, new Loc(5, 0, 9, 2), {}),
                        new Test('<computed name>(line: 13)', 187, 238, new Loc(13, 0, 15, 2), {})
                    ]
                ),

                new Fixture('<computed name>(line: 17)', 241, 353, new Loc(17, 0, 20, 26), {},
                    [
                        new Test('Fixture2Test1', 356, 413, new Loc(22, 0, 24, 2), {})
                    ]
                )
            ],
            [
                new Fixture('Fixture3', 30, 136, new Loc(3, 0, 6, 27), {},
                    [
                        new Test('<computed name>(line: 10)', 178, 271, new Loc(10, 0, 14, 2), {})
                    ]
                )
            ],
            [
                new Fixture('Fixture4', 16, 35, new Loc(1, 16, 1, 35), {},
                    [
                        new Test('F4T1', 38, 89, new Loc(3, 0, 5, 2), {})
                    ]
                )
            ]
        ];

        return testJSFilesParser('./data/test-suites/basic', expectedStructure);
    });

    it('Fixture name is not a string', function () {
        const expectedStructure = [[
            new Fixture('Yo', 173, 185, new Loc(5, 0, 5, 12), {},
                [
                    new Test('Test', 214, 254, new Loc(9, 0, 11, 2), {})
                ]
            )
        ]];

        return testJSFilesParser('./data/test-suites/fixture-name-is-not-a-string', expectedStructure);
    });

    it('Test name is not a string', function () {
        const expectedStructure = [
            [
                new Fixture('Test name is not a string', 0, 35, new Loc(1, 0, 1, 35), {},
                    [
                        new Test('TheAnswer', 210, 238, new Loc(6, 0, 7, 2), {})
                    ]
                )
            ]];

        return testJSFilesParser('./data/test-suites/test-name-is-not-a-string', expectedStructure);
    });

    it('Call from async function', function () {
        const expectedStructure = [
            [
                new Fixture('fixture 1', 0, 20, new Loc(1, 0, 1, 20), {},
                    [
                        new Test('test 1', 466, 480, new Loc(38, 0, 38, 14), {})
                    ]
                )]
        ];

        return testJSFilesParser('./data/test-suites/call-fixture-from-async-function', expectedStructure);
    });

    it('Hooks in test file', function () {
        const expectedStructure = [
            [
                new Fixture('fixture1', 0, 23, new Loc(1, 0, 1, 23), {},
                    [
                        new Test('fixture1test1', 26, 111, new Loc(3, 0, 9, 2), {})
                    ]
                ),

                new Fixture('fixture2', 115, 137, new Loc(12, 0, 12, 22), {},
                    [
                        new Test('fixture2test1', 140, 164, new Loc(14, 0, 14, 24), {}),
                        new Test('fixture2test2', 166, 190, new Loc(15, 0, 15, 24), {}),
                        new Test('fixture2test3', 193, 241, new Loc(17, 0, 17, 48), {}),
                        new Test('fixture2test4', 243, 269, new Loc(18, 0, 18, 26), {})
                    ]
                ),

                new Fixture('fixture 3', 272, 297, new Loc(20, 0, 20, 25), {},
                    [
                        new Test('fixture3test1', 300, 348, new Loc(22, 0, 22, 48), {}),
                        new Test('fixture3test2', 350, 376, new Loc(23, 0, 23, 26), {}),
                        new Test('fixture3test4', 379, 468, new Loc(25, 0, 32, 6), {})
                    ]
                ),

                new Fixture('fixture4', 472, 554, new Loc(35, 0, 38, 16), {},
                    [
                        new Test('fixture4test1', 557, 636, new Loc(40, 0, 43, 21), {})
                    ]
                ),

                new Fixture('fixture5', 639, 721, new Loc(45, 0, 48, 16), {},
                    [
                        new Test('fixture5test1', 724, 801, new Loc(50, 0, 53, 19), {})
                    ]
                ),

                new Fixture('fixture6', 804, 912, new Loc(55, 0, 59, 25), {},
                    [
                        new Test('fixture6test1', 915, 1026, new Loc(61, 0, 65, 31), {})
                    ]
                ),

                new Fixture('fixture7', 1029, 1137, new Loc(67, 0, 71, 25), {},
                    [
                        new Test('fixture7test1', 1140, 1251, new Loc(73, 0, 77, 31), {})
                    ]
                ),

                new Fixture('fixture8', 1254, 1360, new Loc(79, 0, 83, 25), {},
                    [
                        new Test('<computed name>(line: 88)', 1363, 1467, new Loc(85, 0, 89, 31), {})
                    ]
                )
            ]
        ];

        return testJSFilesParser('./data/test-suites/fixture-and-test-hooks', expectedStructure);
    });

    it('Tests and fixtures definitions in IIFE', function () {
        const expectedStructure = [[
            new Fixture('fixture', 19, 59, new Loc(2, 4, 2, 44), {},
                [
                    new Test('testName', 83, 158, new Loc(5, 8, 7, 10), {})
                ]
            )
        ]];

        return testJSFilesParser('./data/test-suites/tests-fixtures-in-iife', expectedStructure);
    });

    it('Hooks in test file - invalid usage', function () {
        const expectedStructure = [[]];

        return testJSFilesParser('./data/test-suites/fixture-and-test-hooks-invalid-usage', expectedStructure);
    });

    it('Meta info', function () {
        const fixture1Meta = {
            metaField1: 'fixtureMetaValue1',
            metaField2: 'fixtureMetaUpdatedValue2',
            metaField3: 'fixtureMetaValue3'
        };

        const testMeta = {
            metaField1: 'testMetaValue1',
            metaField4: 'testMetaUpdatedValue4',
            metaField5: 'testMetaValue5'
        };

        const fixtureComputedMetaData1 = {
            'field 1': 'field 1',
            'field 2': '<computed name>(line: 5)',
            'field 3': '<computed name>(line: 6)'
        };

        const testComputedMetaData1 = {
            'field 1': 'field 1',
            'field 2': '<computed name>(line: 10)',
            'field 3': '<computed name>(line: 11)'
        };

        const fixtureComputedMetaData2 = {
            'field 1': 'field 1',
            'field 2': '<computed name>(line: 15)',
            'field 3': '<computed name>(line: 16)'
        };

        const testComputedMetaData2 = {
            'field 1': 'field 1',
            'field 2': '<computed name>(line: 20)',
            'field 3': '<computed name>(line: 21)'
        };

        const testComputedMetaData3 = {};

        const expectedStructure = [
            [
                new Fixture('Fixture1', 23, 150, new Loc(3, 0, 6, 32), fixtureComputedMetaData1, [
                    new Test('Test1', 153, 274, new Loc(8, 0, 11, 32), testComputedMetaData1)
                ]),

                new Fixture('Fixture2', 277, 416, new Loc(13, 0, 16, 36), fixtureComputedMetaData2, [
                    new Test('Test2', 419, 552, new Loc(18, 0, 21, 36), testComputedMetaData2),
                    new Test('Test3', 555, 1071, new Loc(23, 0, 54, 6), testComputedMetaData3)
                ])
            ],

            [
                new Fixture('Fixture1', 0, 63, new Loc(1, 0, 3, 11), {}, [
                    new Test('Fixture1Test1', 66, 135, new Loc(5, 0, 8, 6), {})
                ])
            ],

            [
                new Fixture('Fixture1', 0, 51, new Loc(1, 0, 2, 31), {}, [
                    new Test('Fixture1Test1', 54, 139, new Loc(4, 0, 8, 6), {})
                ])
            ],

            [
                new Fixture('Fixture1', 0, 228, new Loc(1, 0, 5, 51), fixture1Meta, [
                    new Test('Fixture1Test1', 231, 465, new Loc(7, 0, 13, 48), testMeta)
                ]),

                new Fixture('Fixture2', 468, 511, new Loc(15, 0, 16, 23), {}, [
                    new Test('Fixture2Test1', 514, 589, new Loc(18, 0, 20, 21), {})
                ])
            ]
        ];

        return testJSFilesParser('./data/test-suites/meta', expectedStructure);
    });
});

describe('Should get structure of TypeScript files', function () {
    it('Smoke test', () => {
        const expectedStructure = [
            [
                new Fixture('fixture 1', 72, 132, new Loc(5, 0, 5, 60), {},
                    [
                        new Test('test 1', 246, 325, new Loc(9, 0, 11, 2), {})
                    ]
                ),

                new Fixture('<computed name>(line: 14)', 380, 422, new Loc(14, 1, 14, 43), {},
                    [
                        new Test('<computed name>(line: 15)', 425, 456, new Loc(15, 1, 16, 3), {})
                    ]
                )
            ],

            [
                new Fixture('fixture 1', 97, 138, new Loc(9, 9, 9, 50), {},
                    [
                        new Test('test 1', 147, 222, new Loc(11, 6, 13, 12), {})
                    ]
                )
            ]
        ];

        return testTypeScriptFilesParser('./data/test-suites/typescript-parser-smoke', expectedStructure);
    });
});

describe('Should get structure of CoffeeScript files', function () {
    it('Smoke test', () => {
        const expectedStructure = [
            [
                new Fixture('fixture 1', 94, 138, new Loc(7, 0, 7, 44), {},
                    [
                        new Test('test 1', 221, 291, new Loc(13, 0, 15, 2), {})
                    ]
                ),

                new Fixture('<computed name>(line: 18)', 331, 373, new Loc(18, 2, 18, 44), {},
                    [
                        new Test('<computed name>(line: 19)', 384, 409, new Loc(19, 9, 19, 34), {})
                    ]
                )
            ],

            [
                new Fixture('fixture 1', 0, 41, new Loc(1, 0, 1, 41), {},
                    [
                        new Test('test 1', 44, 110, new Loc(3, 0, 5, 12), {})
                    ]
                )
            ]
        ];

        return testCoffeeScriptFilesParser('./data/test-suites/coffeescript-parser-smoke', expectedStructure);
    });
});

describe('Regression', function () {
    it('Parser fails with "JS allocation failed" error (GH-1771)', function () {
        const expectedStructure = [[
            new Fixture('Fixture', 93, 135, new Loc(5, 0, 6, 24), {}, [
                new Test('Test', 138, 167, new Loc(8, 0, 10, 2), {})
            ])
        ]];

        return testJSFilesParser('./data/test-suites/regression-gh-1771', expectedStructure);
    });
});

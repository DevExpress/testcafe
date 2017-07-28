var expect              = require('chai').expect;
var fs                  = require('fs');
var path                = require('path');
var getTestList         = require('../../lib/embedding-utils').getTestList;
var getTestListFromCode = require('../../lib/embedding-utils').getTestListFromCode;
var Promise             = require('pinkie');

function testFixtureParser (dir, expectedStructure) {
    var dirPath  = path.join(__dirname, dir);
    var fileList = fs.readdirSync(dirPath).sort();

    var parseFilePromises = fileList.map(function (filename, index) {
        var filePath = path.join(dirPath, filename);
        var expected = expectedStructure[index];

        return getTestList(filePath).then(function (structure) {
            var fileContent = fs.readFileSync(filePath, 'utf8');

            expect(getTestListFromCode(fileContent)).eql(expected);
            expect(structure).eql(expected);
        });
    });

    return Promise.all(parseFilePromises);
}

describe('Should get structure of esnext files', function () {
    it('Base', function () {
        var expectedStructure = [
            [],
            [],
            [
                {
                    name: 'Fixture1',

                    start: 30,
                    end:   49,

                    loc: {
                        end:   { column: 19, line: 3 },
                        start: { column: 0, line: 3 }
                    },

                    tests: [
                        {
                            name: 'Fixture1Test1',

                            start: 52,
                            end:   148,

                            loc: {
                                end:   { column: 2, line: 9 },
                                start: { column: 0, line: 5 }
                            }
                        },
                        {
                            name: '<computed name>(line: 13)',

                            start: 187,
                            end:   238,

                            loc: {
                                end:   { column: 2, line: 15 },
                                start: { column: 0, line: 13 }
                            }
                        }
                    ]
                },
                {
                    name: '<computed name>(line: 17)',

                    start: 241,
                    end:   353,

                    loc: {
                        start: { line: 17, column: 0 },
                        end:   { line: 20, column: 26 }
                    },

                    tests: [
                        {
                            name: 'Fixture2Test1',

                            start: 356,
                            end:   413,

                            loc: {
                                start: { line: 22, column: 0 },
                                end:   { line: 24, column: 2 }
                            }
                        }
                    ]
                }
            ],
            [
                {
                    name: 'Fixture3',

                    start: 30,
                    end:   136,

                    loc: {
                        start: { line: 3, column: 0 },
                        end:   { line: 6, column: 27 }
                    },

                    tests: [
                        {
                            name: '<computed name>(line: 10)',

                            start: 178,
                            end:   271,

                            loc: {
                                start: { line: 10, column: 0 },
                                end:   { line: 14, column: 2 }
                            }
                        }
                    ]
                }
            ]
        ];

        return testFixtureParser('./data/test-suites/basic', expectedStructure);
    });

    it('Fixture name is not a string', function () {
        var expectedStructure = [[
            {
                name: 'Yo',

                start: 173,
                end:   185,

                loc: {
                    end:   { column: 12, line: 5 },
                    start: { column: 0, line: 5 }
                },

                tests: [
                    {
                        name: 'Test',

                        start: 214,
                        end:   254,

                        loc: {
                            end:   { column: 2, line: 11 },
                            start: { column: 0, line: 9 }
                        }
                    }
                ]
            }
        ]];

        return testFixtureParser('./data/test-suites/fixture-name-is-not-a-string', expectedStructure);
    });

    it('Test name is not a string', function () {
        var expectedStructure = [
            [{
                name: 'Test name is not a string',

                start: 0,
                end:   35,

                loc: {
                    end:   { column: 35, line: 1 },
                    start: { column: 0, line: 1 }
                },

                tests: [
                    {
                        name: 'TheAnswer',

                        start: 210,
                        end:   238,

                        loc: {
                            end:   { column: 2, line: 7 },
                            start: { column: 0, line: 6 }
                        }
                    }
                ]
            }]
        ];

        return testFixtureParser('./data/test-suites/test-name-is-not-a-string', expectedStructure);
    });

    it('Call from async function', function () {
        var expectedStructure = [
            [{
                name: 'fixture 1',

                start: 0,
                end:   20,

                loc: {
                    end:   { column: 20, line: 1 },
                    start: { column: 0, line: 1 }
                },

                tests: [
                    {
                        name: 'test 1',

                        start: 466,
                        end:   480,

                        loc: {
                            end:   { column: 14, line: 38 },
                            start: { column: 0, line: 38 }
                        }

                    }
                ]
            }]
        ];

        return testFixtureParser('./data/test-suites/call-fixture-from-async-function', expectedStructure);
    });

    it('.skip, .after, .before in test file', function () {
        var expectedStructure = [
            [
                {
                    name:  'fixture1',
                    start: 0,
                    end:   23,

                    loc: {
                        end:   { column: 23, line: 1 },
                        start: { column: 0, line: 1 }
                    },

                    tests: [
                        {
                            name: 'fixture1test1',

                            start: 26,
                            end:   111,

                            loc: {
                                end:   { column: 2, line: 9 },
                                start: { column: 0, line: 3 }
                            }

                        }
                    ]
                },
                {
                    name: 'fixture2',

                    start: 115,
                    end:   137,

                    loc: {
                        end:   { column: 22, line: 12 },
                        start: { column: 0, line: 12 }
                    },

                    tests: [
                        {
                            name: 'fixture2test1',

                            start: 140,
                            end:   164,

                            loc: {
                                start: { line: 14, column: 0 },
                                end:   { line: 14, column: 24 }
                            }
                        },
                        {
                            name: 'fixture2test2',

                            start: 166,
                            end:   190,

                            loc: {
                                start: { line: 15, column: 0 },
                                end:   { line: 15, column: 24 }
                            }
                        },
                        {
                            name: 'fixture2test3',

                            start: 193,
                            end:   241,

                            loc: {
                                start: { line: 17, column: 0 },
                                end:   { line: 17, column: 48 }
                            }
                        },
                        {
                            name: 'fixture2test4',

                            start: 243,
                            end:   269,

                            loc: {
                                start: { line: 18, column: 0 },
                                end:   { line: 18, column: 26 }
                            }
                        }
                    ]
                },
                {
                    name: 'fixture 3',

                    start: 272,
                    end:   297,

                    loc: {
                        end:   { column: 25, line: 20 },
                        start: { column: 0, line: 20 }
                    },

                    tests: [
                        {
                            name: 'fixture3test1',

                            start: 300,
                            end:   348,

                            loc: {
                                end:   { column: 48, line: 22 },
                                start: { column: 0, line: 22 }
                            }
                        },
                        {
                            name: 'fixture3test2',

                            start: 350,
                            end:   376,

                            loc: {
                                end:   { column: 26, line: 23 },
                                start: { column: 0, line: 23 }
                            }

                        },
                        {
                            name: 'fixture3test4',

                            start: 379,
                            end:   468,

                            loc: {
                                end:   { column: 6, line: 32 },
                                start: { column: 0, line: 25 }
                            }
                        }
                    ]
                },
                {
                    name: 'fixture4',

                    start: 472,
                    end:   554,

                    loc: {
                        end:   { column: 16, line: 38 },
                        start: { column: 0, line: 35 }
                    },

                    tests: [
                        {
                            name: 'fixture4test1',

                            start: 557,
                            end:   636,

                            loc: {
                                end:   { column: 21, line: 43 },
                                start: { column: 0, line: 40 }
                            }

                        }
                    ]
                },
                {
                    name: 'fixture5',

                    start: 639,
                    end:   721,

                    loc: {
                        end:   { column: 16, line: 48 },
                        start: { column: 0, line: 45 }
                    },

                    tests: [
                        {
                            name: 'fixture5test1',

                            start: 724,
                            end:   801,

                            loc: {
                                end:   { column: 19, line: 53 },
                                start: { column: 0, line: 50 }
                            }
                        }
                    ]
                },
                {
                    name: 'fixture6',

                    start: 804,
                    end:   912,

                    loc: {
                        end:   { column: 25, line: 59 },
                        start: { column: 0, line: 55 }
                    },

                    tests: [
                        {
                            name: 'fixture6test1',

                            start: 915,
                            end:   1026,

                            loc: {
                                end:   { column: 31, line: 65 },
                                start: { column: 0, line: 61 }
                            }
                        }
                    ]
                },
                {
                    name: 'fixture7',

                    start: 1029,
                    end:   1137,

                    loc: {
                        end:   { column: 25, line: 71 },
                        start: { column: 0, line: 67 }
                    },

                    tests: [
                        {
                            name: 'fixture7test1',

                            start: 1140,
                            end:   1251,

                            loc: {
                                end:   { column: 31, line: 77 },
                                start: { column: 0, line: 73 }
                            }

                        }
                    ]
                },
                {
                    name: 'fixture8',

                    start: 1254,
                    end:   1360,

                    loc: {
                        end:   { column: 25, line: 83 },
                        start: { column: 0, line: 79 }
                    },

                    tests: [
                        {
                            name: '<computed name>(line: 88)',

                            start: 1363,
                            end:   1467,

                            loc: {
                                end:   { column: 31, line: 89 },
                                start: { column: 0, line: 85 }
                            }
                        }
                    ]
                }
            ]
        ];

        return testFixtureParser('./data/test-suites/fixture-and-test-hooks', expectedStructure);
    });

    it('Tests and fixtures definitions in IIFE', function () {
        var expectedStructure = [[
            {
                name: 'fixture',

                start: 19,
                end:   59,

                loc: {
                    end: {
                        column: 44,
                        line:   2
                    },

                    start: {
                        column: 4,
                        line:   2
                    }
                },

                tests: [
                    {
                        name: 'testName',

                        start: 83,
                        end:   158,

                        loc: {
                            end: {
                                column: 10,
                                line:   7
                            },

                            start: {
                                column: 8,
                                line:   5
                            }
                        }
                    }
                ]
            }
        ]];

        return testFixtureParser('./data/test-suites/tests-fixtures-in-iife', expectedStructure);
    });

    it('.skip, .after, .before in test file - invalid usage', function () {
        var expectedStructure = [[]];

        return testFixtureParser('./data/test-suites/fixture-and-test-hooks-invalid-usage', expectedStructure);
    });
});

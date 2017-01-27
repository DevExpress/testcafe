var expect       = require('chai').expect;
var fs           = require('fs');
var path         = require('path');
var parseFixture = require('../../lib/utils/parse-fixture');
var Promise      = require('pinkie');

function testFixtureParser (dir, expectedStructure) {
    var dirPath  = path.join(__dirname, dir);
    var fileList = fs.readdirSync(dirPath);

    var parseFilePromises = fileList.map(function (filename, index) {
        var filePath = path.join(dirPath, filename);
        var expected = expectedStructure[index];

        return parseFixture(filePath).then(function (structure) {
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

                    loc: {
                        end: {
                            column: 19,
                            line:   3
                        },

                        start: {
                            column: 0,
                            line:   3
                        }
                    },

                    tests: [
                        {
                            name: 'Fixture1Test1',

                            loc: {
                                end: {
                                    column: 2,
                                    line:   9
                                },

                                start: {
                                    column: 0,
                                    line:   5
                                }
                            }
                        },
                        {
                            name: '<computed name>',

                            loc: {
                                end: {
                                    'column': 2,
                                    'line':   15
                                },

                                start: {
                                    column: 0,
                                    line:   13
                                }
                            }
                        }
                    ]
                },
                {
                    name: '<computed name>',

                    loc: {
                        end: {
                            column: 26,
                            line:   20
                        },

                        start: {
                            column: 0,
                            line:   17
                        }
                    },

                    tests: [
                        {
                            name: 'Fixture2Test1',

                            loc: {
                                end: {
                                    column: 2,
                                    line:   24
                                },

                                start: {
                                    column: 0,
                                    line:   22
                                }
                            }
                        }
                    ]
                }
            ],
            [
                {
                    name: 'Fixture3',

                    loc: {
                        end: {
                            column: 27,
                            line:   6
                        },

                        start: {
                            column: 0,
                            line:   3
                        }
                    },

                    tests: [
                        {
                            name: '<computed name>',

                            loc: {
                                end: {
                                    column: 2,
                                    line:   14
                                },

                                start: {
                                    column: 0,
                                    line:   10
                                }
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

                loc: {
                    end: {
                        column: 12,
                        line:   5
                    },

                    start: {
                        column: 0,
                        line:   5
                    }
                },

                tests: [
                    {
                        name: 'Test',

                        loc: {
                            end: {
                                column: 2,
                                line:   11
                            },

                            start: {
                                column: 0,
                                line:   9
                            }
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

                loc: {
                    end: {
                        column: 35,
                        line:   1
                    },

                    start: {
                        column: 0,
                        line:   1
                    }
                },

                tests: [
                    {
                        name: 'TheAnswer',

                        loc: {
                            end: {
                                column: 2,
                                line:   7
                            },

                            start: {
                                column: 0,
                                line:   6
                            }
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

                loc: {
                    end: {
                        column: 20,
                        line:   1
                    },

                    start: {
                        column: 0,
                        line:   1
                    }
                },


                tests: [
                    {
                        name: 'test 1',

                        loc: {
                            end: {
                                column: 14,
                                line:   38
                            },

                            start: {
                                column: 0,
                                line:   38
                            }
                        }

                    }
                ]
            }]
        ];

        return testFixtureParser('./data/test-suites/call-fixture-from-async-function', expectedStructure);
    });
});

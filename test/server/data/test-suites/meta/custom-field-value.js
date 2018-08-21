const fieldIndex = 2;

fixture `Fixture1`
    .meta('field 1', `field 1`)
    .meta('field 2', `field ${fieldIndex}`)
    .meta('field 3', fieldIndex);

test `Test1`
    .meta('field 1', `field 1`)
    .meta('field 2', `field ${fieldIndex}`)
    .meta('field 3', fieldIndex);

fixture `Fixture2`
    .meta({ 'field 1': `field 1` })
    .meta({ 'field 2': `field ${fieldIndex}` })
    .meta({ 'field 3': fieldIndex });

test `Test2`
    .meta({ 'field 1': `field 1` })
    .meta({ 'field 2': `field ${fieldIndex}` })
    .meta({ 'field 3': fieldIndex });

test `Test3`
    .meta({
        field1: true,
        field2: 1,
        field3: null,
        field4: void 0,
        field5: Symbol(),

        field6: {},
        field7: {
            a: 1,
            b: true,
            c: _c,
            d: function () {

            },
            e: {
                f: g.i
            }
        },

        field8: [],
        field9: [1, 'string', a, b.c, function () {

        }],

        field10: function () {
        },

        field11: () => {
        }
    });

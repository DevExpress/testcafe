/*global Symbol*/

// HACK: used to validate that ClientFunction `boundTestRun` option value
// is a TestRun. With the marker symbol approach we can safely use
// ClientFunctionBuilder in TestRun without circular reference.
export default Symbol('testRun');

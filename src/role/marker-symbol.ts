// HACK: used to validate that UseRoleCommand argument value
// is a Role. With the marker symbol approach we can safely use
// commands in Role without circular reference.
const markerSymbol = Symbol('testRun');

export default markerSymbol;


// Update this array if you add/rename/remove files in this directory.
var modules = [
    "internal",
    "sbcs-codec",
    "sbcs-data",
    "sbcs-data-generated",
    "dbcs-codec",
    "dbcs-data",
];

// Load all encoding definition files. Support Browserify by skipping fs module.
modules.forEach(function(moduleName) {
    var module = require("./"+moduleName);
    for (var enc in module)
        exports[enc] = module[enc];
});

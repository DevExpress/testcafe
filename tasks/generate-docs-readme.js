var gulp = require('gulp');
var yaml = require('js-yaml');
var fs = require('fs');

//Documentation
gulp.task('generate-docs-readme', generateDocsReadmeTask);

function generateDocsReadmeTask () {
    var toc = yaml.safeLoad(fs.readFileSync('docs/nav/nav-menu.yml', 'utf8'));
    var readme = generateReadme(toc);

    fs.writeFileSync('docs/README.md', readme);
}

function generateReadme (toc) {
    var tocList = generateDirectory(toc, 0);

    return '# Documentation\n\n> This is a development version of the documentation. ' +
       'The functionality described here may not be included in the current release version. ' +
       'Unreleased functionality may change or be dropped before the next release. ' +
       'Documentation for the release version is available at the [TestCafe website](https://devexpress.github.io/testcafe/getting-started/).\n\n' +
       tocList;
}

function generateItem (name, url, level) {
    return ' '.repeat(level * 2) + '* [' + name + '](articles' + url + ')\n';
}

function generateDirectory (tocItems, level) {
    var res = '';

    tocItems.forEach(function (item) {
        res += generateItem(item.name ? item.name : item.url, item.url, level);

        if (item.content)
            res += generateDirectory(item.content, level + 1);
    });

    return res;
}

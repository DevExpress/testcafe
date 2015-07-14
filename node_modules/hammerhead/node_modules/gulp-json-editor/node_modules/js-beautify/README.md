# JS Beautifier
[![Build Status](https://secure.travis-ci.org/einars/js-beautify.png?branch=master)](http://travis-ci.org/einars/js-beautify)
[![NPM version](https://badge.fury.io/js/js-beautify.png)](http://badge.fury.io/js/js-beautify)

This little beautifier will reformat and reindent bookmarklets, ugly
JavaScript, unpack scripts packed by Dean Edward’s popular packer,
as well as deobfuscate scripts processed by
[javascriptobfuscator.com](http://javascriptobfuscator.com/).

# Usage
You can beautify javascript using JS Beautifier in your web browser, or on the command-line using node.js or python.

## Web Browser
Open [jsbeautifier.org](http://jsbeautifier.org/).  Options are available via the UI.

## Python
To beautify using python:

```bash
$ pip install jsbeautifier
$ js-beautify file.js
```

Beautified output goes to `stdout`.

To use `jsbeautifier` as a library is simple:

``` python
import jsbeautifier
res = jsbeautifier.beautify('your javascript string')
res = jsbeautifier.beautify_file('some_file.js')
```

...or, to specify some options:

``` python
opts = jsbeautifier.default_options()
opts.indent_size = 2
res = jsbeautifier.beautify('some javascript', opts)
```

## JavaScript

As an alternative to the Python script, you may install the NPM package `js-beautify`. When installed globally, it provides an executable `js-beautify` script. As with the Python script, the beautified result is sent to `stdout` unless otherwise configured.

```bash
$ npm -g install js-beautify
$ js-beautify foo.js
```

You can also use `js-beautify` as a `node` library (install locally, the `npm` default):

```bash
$ npm install js-beautify
```

```js
var beautify = require('js-beautify').js_beautify,
    fs = require('fs');

fs.readFile('foo.js', 'utf8', function (err, data) {
    if (err) {
        throw err;
    }
    console.log(beautify(data, { indent_size: 2 }));
});
```

## Options

These are the command-line flags for both Python and JS scripts:

```text
CLI Options:
  -f, --file       Input file(s) (Pass '-' for stdin)
  -r, --replace    Write output in-place, replacing input
  -o, --outfile    Write output to file (default stdout)
  --config         Path to config file
  --type           [js|css|html] ["js"]
  -q, --quiet      Suppress logging to stdout
  -h, --help       Show this help
  -v, --version    Show the version

Beautifier Options:
  -s, --indent-size             Indentation size [4]
  -c, --indent-char             Indentation character [" "]
  -l, --indent-level            Initial indentation level [0]
  -t, --indent-with-tabs        Indent with tabs, overrides -s and -c
  -p, --preserve-newlines       Preserve line-breaks (--no-preserve-newlines disables)
  -m, --max-preserve-newlines   Number of line-breaks to be preserved in one chunk [10]
  -P, --space-in-paren          Add padding spaces within paren, ie. f( a, b )
  -j, --jslint-happy            Enable jslint-stricter mode
  -b, --brace-style             [collapse|expand|end-expand] ["collapse"]
  -B, --break-chained-methods   Break chained method calls across subsequent lines
  -k, --keep-array-indentation  Preserve array indentation
  -x, --unescape-strings        Decode printable characters encoded in xNN notation
  -w, --wrap-line-length        Wrap lines at next opportunity after N characters [0]
  -X, --e4x                     Pass E4X xml literals through untouched
  --good-stuff                  Warm the cockles of Crockford's heart
```

These largely correspond to the underscored option keys for both library interfaces, which have these defaults:

```json
{
    "indent_size": 4,
    "indent_char": " ",
    "indent_level": 0,
    "indent_with_tabs": false,
    "preserve_newlines": true,
    "max_preserve_newlines": 10,
    "jslint_happy": false,
    "brace_style": "collapse",
    "keep_array_indentation": false,
    "keep_function_indentation": false,
    "space_before_conditional": true,
    "break_chained_methods": false,
    "eval_code": false,
    "unescape_strings": false,
    "wrap_line_length": 0
}
```

In addition to CLI arguments, you may pass config to the JS executable via:

 * any `jsbeautify_`-prefixed environment variables
 * a `JSON`-formatted file indicated by the `--config` parameter
 * a `.jsbeautifyrc` file containing `JSON` data at any level of the filesystem above `$PWD`

Configuration sources provided earlier in this stack will override later ones.

You might notice that the CLI options and defaults hash aren't 100% correlated. Historically, the Python and JS APIs have not been 100% identical. For example, `space_before_conditional` is currently JS-only, and not addressable from the CLI script. There are a few other additional cases keeping us from 100% API-compatibility. Patches welcome!

### CSS & HTML

In addition to the `js-beautify` executable, `css-beautify` and `html-beautify` are also provided as an easy interface into those scripts. Alternatively, `js-beautify --css` or `js-beautify --html` will accomplish the same thing, respectively.

```js
// Programmatic access
var beautify_js = require('js-beautify'); // also available under "js" export
var beautify_css = require('js-beautify').css;
var beautify_html = require('js-beautify').html;

// All methods accept two arguments, the string to be beautified, and an options object.
```

The CSS & HTML beautifiers are much simpler in scope, and possess far fewer options.

```text
CSS Beautifier Options:
  -s, --indent-size             Indentation size [4]
  -c, --indent-char             Indentation character [" "]

HTML Beautifier Options:
  -I, --indent-inner-html       Indent <head> and <body> sections. Default is false.
  -s, --indent-size             Indentation size [4]
  -c, --indent-char             Indentation character [" "]
  -b, --brace-style             [collapse|expand|end-expand] ["collapse"]
  -S, --indent-scripts          [keep|separate|normal] ["normal"]
  -w, --wrap-line-length        Maximum characters per line (0 disables) [250]
  -p, --preserve-newlines       Preserve existing line-breaks (--no-preserve-newlines disables)
  -m, --max-preserve-newlines   Maximum number of line-breaks to be preserved in one chunk [10]
  -U, --unformatted             List of tags (defaults to inline) that should not be reformatted
```

# License

You are free to use this in any way you want, in case you find this
useful or working for you but you must keep the copyright notice and license. (MIT)

# Credits

* Written by Einar Lielmanis, <einar@jsbeautifier.org>
* Python version flourished by Stefano Sanfilippo <a.little.coder@gmail.com>
* General maintenance and expansion by Liam Newman <bitwiseman@gmail.com>
* Command-line for node.js by Daniel Stockman <daniel.stockman@gmail.com>

Thanks also to Jason Diamond, Patrick Hof, Nochum Sossonko, Andreas Schneider, Dave
Vasilevsky, Vital Batmanov, Ron Baldwin, Gabriel Harrison, Chris J. Shull,
Mathias Bynens, Vittorio Gambaletta and others.
js-beautify@1.3.4


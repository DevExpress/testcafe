# Whacko
[![Build Status](https://api.travis-ci.org/inikulin/whacko.svg)](https://travis-ci.org/inikulin/whacko)

Whacko is a fork of the [cheerio](https://github.com/MatthewMueller/cheerio) that uses [parse5](https://github.com/inikulin/parse5) as an underlying platform.

## Install
```
$ npm install whacko
```

## API
Difference with cheerio:
* Use `$.load(content)` to load HTML documents (e.g. missing `<html>` tags will be automatically emitted in this case).
* Use `$(content)` to create HTML-fragments which can be later added to the loaded document.
* Parser options (e.g. `xmlMode` and `normalizeWhitespace`) are missing since whacko is intended for spec compliant HTML parsing.
* New parser option `encodeEntities` added. It disables HTML entities decoding on serialization.

In all other aspects it is the same with the [cheerio API](https://github.com/MatthewMueller/cheerio#api).

## Questions or suggestions?
If you have any questions, please feel free to create an issue [here on github](https://github.com/inikulin/whacko/issues).


## Author
[Ivan Nikulin](https://github.com/inikulin) (ifaaan@gmail.com)

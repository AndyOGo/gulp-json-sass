# Gulp-json-scss

> Gulp plugin for turning JSON files into files of scss/sass variable definitions.

*Issues should be reported on the [issue tracker](https://github.com/AndyOGo/gulp-json-sass/issues).*

This JSON file can also be read by your Javascript. This will make it easier to keep your JS code used for layout and your CSS code in sync.

Supports all JSON objects, including nested objects, arrays and keys which are not legal key names (variable names that begin with a number will be prefixed; variable names containing illegal characters will have those characters escaped.)

Ignores (passes through) files with a extensions other than `.json`.

## Installation

```sh
npm install --save gulp-json-scss
```

## Example

In this example gulpfile, a JSON file is turned into a file of sass variables, concatenated with a sass file, and compiled using `gulp-ruby-sass`.

```js
var jsonSass = require('gulp-json-scss'),
    gulp = require('gulp'),
    concat = require('gulp-concat'),
    sass = require('gulp-ruby-sass');

gulp.task('sass', function() {
  return gulp
    .src(['example.json', 'example.sass'])
    .pipe(jsonSass({
      sass: true
    }))
    .pipe(concat('output.sass'))
    .pipe(sass())
    .pipe(gulp.dest('out/'));
});
```

## API

### jsonSass(options)

Returns: `stream`

#### options

Type: `object`

##### delim

Type: `string`  
Default: `-`

String used to delimit nested objects. For example, if `delim` is `'-'`, then

```js
{
  "someObject" : {
    "someKey" : 123
  }
}
```

will be converted into (in scss mode):

```scss
$someObject-someKey: 123;
```

Note that keys can contain the delimiter. No attempt is made to ensure that variable names are unique.

##### Sass

Type: `boolean`  
Default: `false`

If truthy, output valid sass variables. If false, output scss variables.

##### ignoreJsonErrors

Type: `boolean`  
Default: `false`

If true, malformed JSON does not result in the plugin emitting an error.

##### emptyKeyFirst

Type: `boolean`
Default: `true`

If true, empty keys of an object are output first.

##### skipDelimAtEmptyKeys

Type: `boolean`
Default: `true`

If true, delimiters are only added for keys which are not empty string

##### groupRelated

Type: `boolean`
Default: `true`

If true, it will add an additional newline after each related sass variables

##### escapeIllegalCharacters

Type: `boolean`  
Default: `true`

If true, escapes illegal characters in variable names with a backslash (`\`). See http://stackoverflow.com/questions/17191265/legal-characters-for-sass-and-scss-variable-names

The following characters are escaped: `!"#$%&'()*+,./:;<=>?@[]^{|}~` and white space.

##### prefixFirstNumericCharacter

Type: `boolean`  
Default: `true`

If true, **top-level** keys that begin with a number will be prefixed with `options.firstCharacter`, but **not** keys of nested objects. For example,

```js
{
  "1maca" : {
    "2maca" : "asdf"
  },
  "3maca" : "rena"
}
```

Will result in, in scss mode, with `options.firstCharacter` and `options.delim` left as the defaults:

```scss
$_1maca-2maca: asdf;
$_3maca: rena;
```

##### firstCharacter

Type: `string`  
Default: `_`

What string to use to prefix numeric top-level keys.

##### interceptor

Type: `function`
Return: `string`

If given, a callback is expected to handle the variable name, and definition. Return a valid SASS/SCSS string.

## License

MIT.
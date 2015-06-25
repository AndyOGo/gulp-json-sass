var through = require('through'),
  chalk = require('chalk'),
  gulpmatch = require('gulp-match'),
  path = require('path'),
  gutil = require('gulp-util');

// from http://stackoverflow.com/questions/17191265/legal-characters-for-sass-and-scss-variable-names
var escapableCharactersRegex = /(["!#$%&\'()*+,.\/:;\s<=>?@\[\]^\{\}|~])/g;
function replaceEscapableCharacters(str) {
  return str.replace(escapableCharactersRegex, function(a,b) {
    return '\\' + b;
  });
}
var firstCharacterIsNumber = /^[0-9]/;

module.exports = function(opt) {
  opt = opt || {};
  opt.delim = opt.delim || '-';
  opt.sass = !!opt.sass;
  opt.eol = opt.sass ? '' : ';';
  opt.emptyKeyFirst = opt.emptyKeyFirst === undefined ? true : !!opt.emptyKeyFirst;
  opt.skipDelimAtEmptyKeys = opt.skipDelimAtEmptyKeys === undefined ? true : !!opt.skipDelimAtEmptyKeys;
  opt.groupRelated = opt.groupRelated === undefined ? true : !!opt.groupRelated;
  opt.ignoreJsonErrors = !!opt.ignoreJsonErrors;
  opt.escapeIllegalCharacters = opt.escapeIllegalCharacters === undefined ? true : opt.escapeIllegalCharacters;
  opt.firstCharacter = opt.firstCharacter || '_';
  opt.prefixFirstNumericCharacter = opt.prefixFirstNumericCharacter === undefined ? true : opt.prefixFirstNumericCharacter;

  return through(processJSON);

  /////////////

  function processJSON(file) {

    // if it does not have a .json suffix, ignore the file
    if (!gulpmatch(file,'**/*.json')) {
      this.push(file);
      return;
    }

    // load the JSON
    try {
      var parsedJSON = JSON.parse(file.contents);
    } catch (e) {
      if (opt.ignoreJsonErrors) {
        console.log(chalk.red('[gulp-json-scss]') + ' Invalid JSON in ' + file.path + '. (Continuing.)');
      } else {
        console.log(chalk.red('[gulp-json-scss]') + ' Invalid JSON in ' + file.path);
        this.emit('error', e);
      }
      return;
    }

    // process the JSON
    var sassVariables = [];

    loadVariablesRecursive(parsedJSON, '', function pushVariable(assignmentString) {
      if(assignmentString === '' && sassVariables[sassVariables.length - 1] === '')
        return;

      if(typeof opt.interceptor === 'function' && assignmentString !== '') {
        assignmentString = assignmentString.split(':');
        assignmentString = opt.interceptor(assignmentString[0], assignmentString[1]);
      }

      sassVariables.push(assignmentString);
    });

    var sass = sassVariables.join('\n').trimRight();
    file.contents = Buffer(sass);

    file.path = gutil.replaceExtension(file.path, opt.sass ? '.sass' : '.scss');

    this.push(file);
  }

  function loadVariablesRecursive(obj, path, cb) {
    // load empty keys first
    if(opt.emptyKeyFirst && '' in obj) {
      processVariable(obj, path, cb, '');
    }

    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {

        // load empty keys first
        if(opt.emptyKeyFirst && key === '') {
          continue;
        }

        processVariable(obj, path, cb, key);
      }
    }
  }

  function processVariable(obj, path, cb, key) {
    var val = obj[key];

    // escape invalid sass characters
    if (opt.escapeIllegalCharacters) {
      key = replaceEscapableCharacters(key);
    }

    // sass variables cannot begin with a number
    if (path === '' && firstCharacterIsNumber.exec(key) && opt.prefixFirstNumericCharacter) {
      key = opt.firstCharacter + key;
    }

    // skip delimiters for empty keys
    if(opt.skipDelimAtEmptyKeys && key === '') {
      path = path.slice(0, -1);
    }

    if (typeof val !== 'object') {
      cb('$' + path + key + ': ' + val + opt.eol);
    } else {
      loadVariablesRecursive(val, path + key + opt.delim, cb);
      // group related sass variables by newline
      if (opt.groupRelated) {
        cb('');
      }
    }
  }
};
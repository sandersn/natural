/*
 Copyright (c) 2012, Guillaume Marty

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 */


type Map<T> = { [s: string]: T };
/**
 * Generate a replacing function given a table of patterns. Inspired by:
 * http://code.google.com/p/jslibs/wiki/JavascriptTips#String_converter
 * The order of elements is significant. Longer elements should be listed first.
 * @see Speed test http://jsperf.com/build-a-regexp-table
 */
export function replacer(translationTable: Map<string>): (s: string) => string {
    /**
     * An array of translationTable keys.
     */
    var pattern: string[] = [];

    /**
     * Used to iterate over translationTable.
     */
    var key: string;

    for (key in translationTable) {
        // Escaping regexp special chars.
        // @see Speed test for type casting to string http://jsperf.com/string-type-casting/2
        // @see http://closure-library.googlecode.com/svn/docs/closure_goog_string_string.js.source.html#line956
        key = ('' + key).replace(/([-()\[\]{}+?*.$\^|,:#<!\\\/])/g, '\\$1').
            replace(/\x08/g, '\\x08');

        pattern.push(key);
    }

    /**
     * The regular expression doing the replacement job.
     */
    let regExp = new RegExp(pattern.join('|'), 'g');

    /**
     * @param {string} str Input string.
     * @return {string} The string replaced.
     */
    return function(str: string): string {
        return str.replace(regExp, str => translationTable[str]);
    };
}


/**
 * Exchanges all keys with their associated values in an object.
 *
 * @param {Object.<string, string>} obj An object of strings.
 * @return {Object.<string, string>} An object of strings.
 */
export function flip(obj: Map<string>): Map<string> {
    var newObj = Object.create(null);
    for (let key in obj) {
        newObj[obj[key]] = key;
    }

    return newObj;
}


/**
 * Merge several objects. Properties from earlier objects are overwritten by
 * laters's in case of conflict.
 *
 * @param {...Object.<string, string>} var_args One or more objects of strings.
 * @return {!Object.<string, string>} An object of strings.
 */
export function merge(...var_args: Map<string>[]): Map<string> {
    var args = [].slice.call(arguments),
    newObj = Object.create(null),
    id = 0, key;

    while (args[id]) {
        for (key in args[id]) {
            newObj[key] = args[id][key];
        }

        id++;
    }

    return newObj;
}

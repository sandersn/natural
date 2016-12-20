/*
Copyright (c) 2015, Luís Rodrigues

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
  'use strict';

/**
 * Stemmer token constructor.
 */
class Token {
    string: string;
    vowels: string | string[];
    regions: { [s: string]: number | number[] };
    original: string;

    constructor(string: string) {
        this.vowels = '';
        this.regions = {};
        this.string = string;
        this.original = string;
    }

    /**
     * Set vowels.
     *
     * @param   vowels List of vowels.
     * @return         Token instance.
     */
    usingVowels(vowels: string | string[]) {
        this.vowels = vowels;
        return this;
    };

    /**
     * Marks a region by defining its starting index or providing a callback
     * function that does.
     *
     * @param  region   Region name.
     * @param  args     Callback arguments or region start index.
     * @param  callback Function that determines the start index (optional).
     * @param  context  Callback context (optional, defaults to this).
     * @return Token instance.
     */
    markRegion(region: string, args: number | number[], callback?: (...ns: number[]) => number, context?: any) {
        if (typeof callback === 'function') {
            this.regions[region] = callback.apply(context || this, [].concat(args));

        } else if (!isNaN(args as number)) {
            this.regions[region] = args;
        }

        return this;
    };

    /**
     * Replaces all instances of a string with another.
     *
     * @param  find    String to be replaced.
     * @param  replace Replacement string.
     * @return Token instance.
     */
    replaceAll(find: string, replace: string) {
        this.string = this.string.split(find).join(replace);
        return this;
    };

    /**
     * Replaces the token suffix if in a region.
     *
     * @param  suffix  Suffix to replace.
     * @param  replace Replacement string.
     * @param  region  Region name.
     * @return Token instance.
     */
    replaceSuffixInRegion(suffix: string | string[], replace: string, region: string) {
        var suffixes = [].concat(suffix);
        for (var i = 0; i < suffixes.length; i++) {
            if (this.hasSuffixInRegion(suffixes[i], region)) {
                this.string = this.string.slice(0, -suffixes[i].length) + replace;
                return this;
            }
        }
        return this;
    };

    /**
     * Determines whether the token has a vowel at the provided index.
     *
     * @param  index Character index.
     * @return Whether the token has a vowel at the provided index.
     */
    hasVowelAtIndex(index: number) {
        return this.vowels.indexOf(this.string[index]) !== -1;
    };

    /**
     * Finds the next vowel in the token.
     *
     * @param  {Integer} start Starting index offset.
     * @return {Integer}       Vowel index, or the end of the string.
     */
    nextVowelIndex(start: number) {
        var index = (start >= 0 && start < this.string.length) ? start : this.string.length;
        while (index < this.string.length && !this.hasVowelAtIndex(index)) {
            index++;
        }
        return index;
    };

    /**
     * Finds the next consonant in the token.
     *
     * @param  start Starting index offset.
     * @return       Consonant index, or the end of the string.
     */
    nextConsonantIndex(start: number) {
        var index = (start >= 0 && start < this.string.length) ? start : this.string.length;
        while (index < this.string.length && this.hasVowelAtIndex(index)) {
            index++;
        }
        return index;
    };

    /**
     * Determines whether the token has the provided suffix.
     * @param  {String}  suffix Suffix to match.
     * @return {Boolean}        Whether the token string ends in suffix.
     */
    hasSuffix(suffix: string) {
        return this.string.slice(-suffix.length) === suffix;
    };

    /**
     * Determines whether the token has the provided suffix within the specified
     * region.
     *
     * @param  {String}  suffix Suffix to match.
     * @param  {String}  region Region name.
     * @return {Boolean}        Whether the token string ends in suffix.
     */
    hasSuffixInRegion(suffix: string, region: string) {
        var regionStart = this.regions[region] || 0,
        suffixStart = this.string.length - suffix.length;
        return this.hasSuffix(suffix) && suffixStart >= regionStart;
    };
}

export = Token;

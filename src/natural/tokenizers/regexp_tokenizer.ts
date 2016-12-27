/*
Copyright (c) 2011, Rob Ellis, Chris Umbel

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

import Tokenizer = require('./tokenizer');
import _ = require('underscore');

interface RegexpOptions {
    pattern?: string | RegExp;
    discardEmpty?: boolean;
    gaps?: boolean;
}

// Base Class for RegExp Matching
export class RegexpTokenizer extends Tokenizer {
    _pattern: string | RegExp;
    discardEmpty: boolean;
    _gaps: boolean;
    constructor(options?: RegexpOptions) {
        super();
        options = options || {};
        this._pattern = options.pattern || this._pattern;
        this.discardEmpty = options.discardEmpty || true;

        // Match and split on GAPS not the actual WORDS
        if (options.gaps === undefined) {
            this._gaps = true;
        }
        else {
            this._gaps = options.gaps;
        }
    }

    tokenize(s: string) {
        if (this._gaps) {
            var results = s.split(this._pattern as string);
            return this.discardEmpty ? _.without(results,'',' ') : results;
        } else {
            return s.match(this._pattern as string) || [];
        }
    }
}

/***
 * A tokenizer that divides a text into sequences of alphabetic and
 * non-alphabetic characters.  E.g.:
 *
 *      >>> WordTokenizer().tokenize("She said 'hello'.")
 *      ['She', 'said', 'hello']
 * 
 */
export class WordTokenizer extends RegexpTokenizer {
    constructor(options?: RegexpOptions) {
        super(options);
        this._pattern = /[^A-Za-zА-Яа-я0-9_]+/;
    }
}

/***
 * A tokenizer that divides a text into sequences of alphabetic and
 * non-alphabetic characters.  E.g.:
 *
 *      >>> WordPunctTokenizer().tokenize("She said 'hello'.")
 *      ["She","said","'","hello","'","."]
 * 
 */
export class WordPunctTokenizer extends RegexpTokenizer {
    constructor(options: RegexpOptions) {
        super(options);
        this._pattern = new RegExp(/(\w+|[а-я0-9_]+|\.|\!|\'|\"")/i);
    };
}

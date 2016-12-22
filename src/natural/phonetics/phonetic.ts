/*
Copyright (c) 2011, Chris Umbel

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

import stopwords = require('../util/stopwords');
import Tokenizer = require('../tokenizers/aggressive_tokenizer');
var tokenizer = new Tokenizer();

export interface Phonetic {
    compare(sa: string, sb: string): boolean;
    attach(): void;
    process(token: string, maxLength?: number): string | string[];
}
export function createPhonetic(process: (s: string, maxLength?: number) => string | string[]): Phonetic {
    return {
        process,
        compare(stringA: string, stringB: string) {
            return process(stringA) == process(stringB);
        },

        attach(this: Phonetic) {
            var phonetic = this;

            (String.prototype as any).soundsLike = function(this: string, compareTo: string) {
                return phonetic.compare(this, compareTo);
            };

            (String.prototype as any).phonetics = function(this: string) {
                return phonetic.process(this);
            };

            (String.prototype as any).tokenizeAndPhoneticize = function(this: string, keepStops: boolean) {
                var phoneticizedTokens = [];

                for (const token of tokenizer.tokenize(this)) {
                    if (keepStops || stopwords.words.indexOf(token) < 0)
                        phoneticizedTokens.push((token as any).phonetics());
                }

                return phoneticizedTokens;
            };
        }
    };
}

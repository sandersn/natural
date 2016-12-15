/*
Copyright (c) 2014, Ismaël Héry

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

import stopwords = require('../util/stopwords_pt');
import Tokenizer = require('../tokenizers/aggressive_tokenizer_pt');
class Stemmer_Pt {
    stem(token: string) {
        return token;
    };

    addStopWord(word: string) {
        stopwords.words.push(word);
    };

    addStopWords(words: string[]) {
        stopwords.words = stopwords.words.concat(words);
    };

    tokenizeAndStem(text: string, keepStops: boolean) {
        var stemmedTokens = [];

        for (const token of new Tokenizer().tokenize(text)) {
            if (keepStops || stopwords.words.indexOf(token.toLowerCase()) === -1) {
                stemmedTokens.push(Stemmer.stem(token));
            }
        }

        return stemmedTokens;
    };

    attach() {
        var Stemmer = this;
        (String.prototype as any).stem = function (this: string) {
            return Stemmer.stem(this);
        };

        (String.prototype as any).tokenizeAndStem = function (this: string, keepStops: boolean) {
            return Stemmer.tokenizeAndStem(this, keepStops);
        };
    };
};

export = Stemmer_Pt;

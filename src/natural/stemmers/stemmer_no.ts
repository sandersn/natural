/*
Copyright (c) 2014, Kristoffer Brabrand

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

import stopwords = require('../util/stopwords_no');
import Tokenizer = require('../tokenizers/aggressive_tokenizer_no');

class Stemmer_No {
    stem(token: string) {
        return token;
    };

    addStopWord(stopWord: string) {
        stopwords.words.push(stopWord);
    };

    addStopWords(moreStopWords: string[]) {
        stopwords.words = stopwords.words.concat(moreStopWords);
    };

    tokenizeAndStem(text: string, keepStops: boolean) {
        var stemmedTokens = [];

        for (const token of new Tokenizer().tokenize(text)) {
            if(keepStops || stopwords.words.indexOf(token.toLowerCase()) == -1)
                stemmedTokens.push(this.stem(token));
        }

        return stemmedTokens;
    };

    attach() {
        var stemmer = this;
        (String.prototype as any).stem = function(this: string) {
            return stemmer.stem(this);
        };

        (String.prototype as any).tokenizeAndStem = function(this: string, keepStops: boolean) {
            return stemmer.tokenizeAndStem(this, keepStops);
        };
    };
}

export = Stemmer_No;

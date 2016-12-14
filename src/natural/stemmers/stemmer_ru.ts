/*
Copyright (c) 2012, Polyakov Vladimir, Chris Umbel

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

import stopwords = require('../util/stopwords_ru');
import Tokenizer = require('../tokenizers/aggressive_tokenizer_ru');

export = function() {
    var stemmer = this;

    stemmer.stem = function(token: string) {
        return token;
    };

    stemmer.tokenizeAndStem = function(text: string, keepStops: boolean) {
        var stemmedTokens = [];
        
        for (const token of new Tokenizer().tokenize(text)) {
            if (keepStops || stopwords.words.indexOf(token) == -1) {
                var resultToken = token.toLowerCase();
                if (resultToken.match(new RegExp('[а-яё0-9]+', 'gi'))) {
                    resultToken = stemmer.stem(resultToken);
                }
                stemmedTokens.push(resultToken);
            }
        }
        
        return stemmedTokens;
    };

    stemmer.attach = function() {
        (String.prototype as any).stem = function(this: string) {
            return stemmer.stem(this);
        };
        
        (String.prototype as any).tokenizeAndStem = function(this: string, keepStops: string) {
            return stemmer.tokenizeAndStem(this, keepStops);
        };
    };
}

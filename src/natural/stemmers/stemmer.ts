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

class Stemmer {
    stem(token: string) {
        return token;
    };

    addStopWord(stopWord: string) {
        stopwords.words.push(stopWord);
    };

    addStopWords(moreStopWords: string[]) {
        stopwords.words = stopwords.words.concat(moreStopWords);
    };

    removeStopWord(stopWord: string) {
        this.removeStopWords([stopWord])
    };

    removeStopWords(moreStopWords: string[]) {
        moreStopWords.forEach(function(stopWord){
            var idx = stopwords.words.indexOf(stopWord);
            if (idx >= 0) {
                stopwords.words.splice(idx, 1);
            }
        });

    };


    tokenizeAndStem(text: string, keepStops?: boolean) {
        var stemmedTokens = [];
        var lowercaseText = text.toLowerCase();
        var tokens = new Tokenizer().tokenize(lowercaseText);

        if (keepStops) {
            for (const token of tokens) {
                stemmedTokens.push(this.stem(token));
            }
        }

        else {
            for (const token of tokens) {
                if (stopwords.words.indexOf(token) == -1)
                    stemmedTokens.push(this.stem(token));
            }
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

export = Stemmer;

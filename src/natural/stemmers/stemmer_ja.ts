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

/**
 * A very basic stemmer that performs the following steps:
 * * Stem katakana.
 * Inspired by:
 * http://svn.apache.org/repos/asf/lucene/dev/trunk/lucene/analysis/kuromoji/src/java/org/apache/lucene/analysis/ja/JapaneseKatakanaStemFilter.java
 *
 * This script assumes input is normalized using normalizer_ja().
 *
 * \@todo Use .bind() in StemmerJa.prototype.attach().
 */

import Tokenizer = require('../tokenizers/tokenizer_ja');
import stopwords = require('../util/stopwords_ja');



/**
 * @constructor
 */
class StemmerJa {
    /**
     * Tokenize and stem a text.
     * Stop words are excluded except if the second argument is true.
     *
     * @param text
     * @param keepStops Whether to keep stop words from the output or not.
     */
    tokenizeAndStem(text: string, keepStops: boolean): string[] {
        var stemmedTokens = [];
        var tokens = new Tokenizer().tokenize(text);

        // This is probably faster than an if at each iteration.
        if (keepStops) {
            for (const token of tokens) {
                var resultToken = token.toLowerCase();
                resultToken = this.stem(resultToken);
                stemmedTokens.push(resultToken);
            }
        } else {
            for (const token of tokens) {
                if (stopwords.words.indexOf(token) == -1) {
                    var resultToken = token.toLowerCase();
                    resultToken = this.stem(resultToken);
                    stemmedTokens.push(resultToken);
                }
            }
        }

        return stemmedTokens;
    }


    /**
     * Stem a term.
     */
    stem(token: string) {
        return this.stemKatakana(token);
    }


    /**
     * Remove the final prolonged sound mark on katakana if length is superior to
     * a threshold.
     *
     * @param token A katakana string to stem.
     * @return A katakana string stemmed.
     */
    stemKatakana(token: string): string {
        var HIRAGANA_KATAKANA_PROLONGED_SOUND_MARK = 'ー';
        var DEFAULT_MINIMUM_LENGTH = 4;

        if (token.length >= DEFAULT_MINIMUM_LENGTH
            && token.slice(-1) === HIRAGANA_KATAKANA_PROLONGED_SOUND_MARK
            && this.isKatakana(token)) {
            token = token.slice(0, token.length - 1);
        }
        return token;
    }


    /**
     * Is a string made of fullwidth katakana only?
     * This implementation is the fastest I know:
     * http://jsperf.com/string-contain-katakana-only/2
     *
     * @param str A string.
     * @return True if the string has katakana only.
     */
    isKatakana(str: string) {
        return !!str.match(/^[゠-ヿ]+$/);
    }

    // Expose an attach function that will patch String with new methods.
    attach() {
        var self = this;

        (String.prototype as any).stem = function(this: string) {
            return self.stem(this);
        };

        (String.prototype as any).tokenizeAndStem = function(this: string, keepStops: boolean) {
            return self.tokenizeAndStem(this, keepStops);
        };
    }
}

export = StemmerJa;

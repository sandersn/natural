import stopwords = require('../util/stopwords_it');
import Tokenizer = require('../tokenizers/aggressive_tokenizer_it');

class Stemmer_It {
    stem(token: string) {
        return token;
    };

    tokenizeAndStem(text: string, keepStops: boolean) {
        var stemmedTokens = [];

        for (const token of new Tokenizer().tokenize(text)) {
            if (keepStops || stopwords.words.indexOf(token) == -1) {
                var resultToken = token.toLowerCase();
                if (resultToken.match(/[a-zàèìòù0-9]/gi)) {
                    resultToken = this.stem(resultToken);
                }
                stemmedTokens.push(resultToken);
            }
        }

        return stemmedTokens;
    }

    attach() {
        var stemmer = this;
        (String.prototype as any).stem = function(this: string) {
            return stemmer.stem(this);
        };

        (String.prototype as any).tokenizeAndStem = function(this: string, keepStops: boolean) {
            return stemmer.tokenizeAndStem(this, keepStops);
        };
    }
}

export = Stemmer_It;

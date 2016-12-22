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

import Classifier = require('./classifier');
import Stemmer = require('../stemmers/stemmer');
import { BayesClassifier as ApparatusBayesClassifier } from  'apparatus';
class BayesClassifier extends Classifier {
    constructor(stemmer: Stemmer, smoothing?: number) {
        var abc = new ApparatusBayesClassifier();
        if (smoothing && isFinite(smoothing)) {
            abc = new ApparatusBayesClassifier(smoothing);
        }
        super(abc, stemmer);
    }

    static restore(classifier: Classifier, stemmer: Stemmer) {
        classifier = Classifier.restore(classifier, stemmer);
        (classifier as any).__proto__ = BayesClassifier.prototype;
        classifier.classifier = ApparatusBayesClassifier.restore(classifier.classifier);

        return classifier;
    }

    static load(filename: string, stemmer: Stemmer, callback: (err: NodeJS.ErrnoException, classifier?: Classifier) => void) {
        Classifier.load(filename, function(err, classifier) {
            if (err) {
                callback(err);
            }
            else {
                callback(err, BayesClassifier.restore(classifier, stemmer));
            }
        });
    }
}

export = BayesClassifier;

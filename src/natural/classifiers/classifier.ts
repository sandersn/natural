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

import PorterStemmer = require('../stemmers/porter_stemmer');
import Stemmer = require('../stemmers/stemmer');
import util = require('util');
import events = require('events');
import fs = require('fs');

interface Doc {
    text: string[];
    label: string;
}

interface OtherClassifier {
    classify(features: number[]): number[];
    getClassifications(features: number[]): number[];
    addExample(features: number[], label: string): void;
    train(): void;
}

class Classifier {
    classifier: OtherClassifier;
    docs: Doc[];
    features: { [s: string]: number };
    stemmer: Stemmer;
    lastAdded: number;
    events: events.EventEmitter;
    constructor(classifier: OtherClassifier, stemmer: Stemmer) {
        this.classifier = classifier;
        this.docs = [];
        this.features = {};
        this.stemmer = stemmer || PorterStemmer;
        this.lastAdded = 0;
        this.events = new events.EventEmitter();
    }

    addDocument(text: string | string[], classification: string | undefined) {
        // Ignore further processing if classification is undefined 
        if(typeof classification === 'undefined') return;

        // If classification is type of string then make sure it's dosen't have blank space at both end  
        if(typeof classification === 'string'){
            classification = classification.trim();
        }
        
        if(typeof text === 'string')
            text = this.stemmer.tokenizeAndStem(text);

        if(text.length === 0) {
            // ignore empty documents
            return;
        }

        this.docs.push({
            label: classification,
            text: text
        });

        for (const token of text) {
            this.features[token] = (this.features[token] || 0) + 1;
        }
    }

    removeDocument(text: string | string[], classification: string | undefined) {
        var docs = this.docs
        , doc
        , pos;

        if (typeof text === 'string') {
            text = this.stemmer.tokenizeAndStem(text);
        }

        for (var i = 0, ii = docs.length; i < ii; i++) {
            doc = docs[i];
            if (doc.text.join(' ') == text.join(' ') &&
                doc.label == classification) {
                pos = i;
            }
        }

        // Remove if there's a match
        if (!isNaN(pos as number)) {
            this.docs.splice(pos as number, 1);

            for (const t of text) {
                delete this.features[t];
            }
        }
    }

    textToFeatures(observation: string | string[]) {
        var features = [];

        if(typeof observation === 'string')
            observation = this.stemmer.tokenizeAndStem(observation);

        for(var feature in this.features) {
            features.push(observation.indexOf(feature) > -1 ? 1 : 0);
        }

        return features;
    }

    train() {
        var totalDocs = this.docs.length;
        for(var i = this.lastAdded; i < totalDocs; i++) {
            var features = this.textToFeatures(this.docs[i].text);
            this.classifier.addExample(features, this.docs[i].label);
            this.events.emit('trainedWithDocument', {index: i, total: totalDocs, doc: this.docs[i]});
            this.lastAdded++;
        }
        this.events.emit('doneTraining', true);
        this.classifier.train();
    }

    retrain() {
        this.classifier = new (this.classifier.constructor as any)();
        this.lastAdded = 0;
        this.train();
    }

    getClassifications(observation: string | string[]) {
        return this.classifier.getClassifications(this.textToFeatures(observation));
    }

    classify(observation: string | string[]) {
        return this.classifier.classify(this.textToFeatures(observation));
    }

    save(filename: string, callback: (err: NodeJS.ErrnoException, classifier: Classifier | null) => void) {
        var data = JSON.stringify(this);
        var classifier = this;
        fs.writeFile(filename, data, 'utf8', function(err) {
            if(callback) {
                callback(err, err ? null : classifier);
            }
        });
    }

    static restore(classifier: Classifier, stemmer: Stemmer) {
        classifier.stemmer = stemmer || PorterStemmer;
        classifier.events = new events.EventEmitter();
        return classifier;
    }

    static load(filename: string, stemmerOrCallback: Stemmer | ((err: NodeJS.ErrnoException, classifier: Classifier) => void), optionalCallback?: (err: NodeJS.ErrnoException, classifier: Classifier) => void) {
        const callback = optionalCallback ? optionalCallback : stemmerOrCallback as ((err: NodeJS.ErrnoException, classifier: Classifier) => void);
        fs.readFile(filename, "utf8", function(err, data) {
            const classifier = err ? undefined : JSON.parse(data);
            if (callback)
                callback(err, classifier);
        });
    }
}

export = Classifier;

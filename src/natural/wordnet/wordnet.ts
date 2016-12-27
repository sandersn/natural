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

import { WordnetData, Pointer, Pos } from './wordnet_types';
import IndexFile = require('./index_file');
import DataFile = require('./data_file');

class WordNet {
    nounIndex: IndexFile;
    verbIndex: IndexFile;
    adjIndex: IndexFile;
    advIndex: IndexFile;
    nounData: DataFile;
    verbData: DataFile;
    adjData: DataFile;
    advData: DataFile;

    constructor(dataDir: string) {
        if (!dataDir) {
            try {
                var WNdb = require('wordnet-db');
            } catch(e) {
                console.error("Please 'npm install wordnet-db' before using WordNet module or specify a dict directory.");
                throw e;
            }
            dataDir = WNdb.path;
        }

        this.nounIndex = new IndexFile(dataDir, 'noun');
        this.verbIndex = new IndexFile(dataDir, 'verb');
        this.adjIndex = new IndexFile(dataDir, 'adj');
        this.advIndex = new IndexFile(dataDir, 'adv');

        this.nounData = new DataFile(dataDir, 'noun');
        this.verbData = new DataFile(dataDir, 'verb');
        this.adjData = new DataFile(dataDir, 'adj');
        this.advData = new DataFile(dataDir, 'adv');
    }

    pushResults(data: DataFile, results: WordnetData[], offsets: number[], callback: (results: WordnetData[]) => void) {
        if(offsets.length == 0) {
            callback(results);
        } else {
            data.get(offsets.pop()!, record => {
                results.push(record);
                this.pushResults(data, results, offsets, callback);
            });
        }
    }

    lookupFromFiles(files: { index: IndexFile, data: DataFile }[], results: WordnetData[], word: string, callback: (results: WordnetData[]) => void) {
        if(files.length == 0)
            callback(results);
        else {
            var file = files.pop()!;

            file.index.lookup(word, record => {
                if(record) {
                    this.pushResults(file.data, results, record.synsetOffset, () => {
                        this.lookupFromFiles(files, results, word, callback);
                    });
                } else {
                    this.lookupFromFiles(files, results, word, callback);
                }
            });
        }
    }

    lookup(word: string, callback: (results: WordnetData[]) => void) {
        word = word.toLowerCase().replace(/\s+/g, '_');

        this.lookupFromFiles([
            {index: this.nounIndex, data: this.nounData},
            {index: this.verbIndex, data: this.verbData},
            {index: this.adjIndex, data: this.adjData},
            {index: this.advIndex, data: this.advData},
        ], [], word, callback);
    }

    get(synsetOffset: number, pos: Pos, callback: (data: WordnetData) => void) {
        this.getDataFile(pos).get(synsetOffset, callback);
    }

    getDataFile(pos: Pos) {
        switch(pos) {
        case 'n':
            return this.nounData;
        case 'v':
            return this.verbData;
        case 'a': case 's':
            return this.adjData;
        case 'r':
            return this.advData;
        }
    }

    loadSynonyms(synonyms: WordnetData[], results: WordnetData[], ptrs: Pointer[], callback: (synonyms: WordnetData[]) => void) {
        if(ptrs.length > 0) {
            var ptr = ptrs.pop()!;

            this.get(ptr.synsetOffset, ptr.pos, synonym => {
                synonyms.push(synonym);
                this.loadSynonyms(synonyms, results, ptrs, callback);
            });
        } else {
            this.loadResultSynonyms(synonyms, results, callback);
        }
    }

    loadResultSynonyms(synonyms: WordnetData[], results: WordnetData[], callback: (synonyms: WordnetData[]) => void) {
        if(results.length > 0) {
            var result = results.pop()!;
            this.loadSynonyms(synonyms, results, result.ptrs, callback);
        } else
            callback(synonyms);
    }

    lookupSynonyms(word: string, callback: (synonyms: WordnetData[]) => void) {
        this.lookup(word, results => {
            this.loadResultSynonyms([], results, callback);
        });
    }

    getSynonyms() {
        var callback = arguments[2] ? arguments[2] : arguments[1];
        var pos = arguments[0].pos ? arguments[0].pos : arguments[1];
        var synsetOffset = arguments[0].synsetOffset ? arguments[0].synsetOffset : arguments[0];

        this.get(synsetOffset, pos, result => {
            this.loadSynonyms([], [], result.ptrs, callback);
        });
    }

}

export = WordNet;

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
import WordNetFile = require('./wordnet_file');
import fs = require('fs');

class DataFile extends WordNetFile {
    constructor(dataDir: string, name: string) {
        super(dataDir, 'data.' + name);
    }

    get(location: number, callback: (data: WordnetData) => void) {
        var buff = new Buffer(4096);

        this.open(function(err, fd, done) {
            WordNetFile.appendLineChar(fd, location, 0, buff, function(line) {
                done();
                var data = line.split('| ');
                var tokens = data[0].split(/\s+/);
                var ptrs: Pointer[] = [];
                var wCnt = parseInt(tokens[3], 16);
                var synonyms = [];

                for(var i = 0; i < wCnt; i++) {
                    synonyms.push(tokens[4 + i * 2]);
                }

                var ptrOffset = (wCnt - 1) * 2 + 6;
                for(var i = 0; i < parseInt(tokens[ptrOffset], 10); i++) {
                    ptrs.push({
                        pointerSymbol: tokens[ptrOffset + 1 + i * 4],
                        synsetOffset: parseInt(tokens[ptrOffset + 2 + i * 4], 10),
                        pos: tokens[ptrOffset + 3 + i * 4] as Pos,
                        sourceTarget: tokens[ptrOffset + 4 + i * 4]
                    });
                }

                // break "gloss" into definition vs. examples
                var glossArray = data[1].split("; ");
                var definition = glossArray[0];
                var examples = glossArray.slice(1);

                for (var k=0; k < examples.length; k++) {
                    examples[k] = examples[k].replace(/\"/g,'').replace(/\s\s+/g,'');
                }

                callback({
                    synsetOffset: parseInt(tokens[0], 10),
                    lexFilenum: parseInt(tokens[1], 10),
                    pos: tokens[2],
                    wCnt: wCnt,
                    lemma: tokens[4],
                    synonyms: synonyms,
                    lexId: tokens[5],
                    ptrs: ptrs,
                    gloss: data[1],
                    def: definition,
                    exp: examples
                });
            });
        });
    }
}

export = DataFile;

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
                var [tokenLine, gloss] = line.split('| ');
                var tokens = tokenLine.split(/\s+/);
                var [synsetOffset, lexFilenum, pos, wCntStr, lemma, lexId] = tokens;
                var wCnt = parseInt(wCntStr, 16);
                var ptrs = [];
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
                var [definition, ...examples] = gloss.split("; ");

                for (var k=0; k < examples.length; k++) {
                    examples[k] = examples[k].replace(/\"/g,'').replace(/\s\s+/g,'');
                }
                callback({
                    synsetOffset: parseInt(synsetOffset, 10),
                    lexFilenum: parseInt(lexFilenum, 10),
                    pos,
                    wCnt,
                    lemma,
                    synonyms,
                    lexId,
                    ptrs,
                    gloss,
                    def: definition,
                    exp: examples
                });
            });
        });
    }
}

export = DataFile;

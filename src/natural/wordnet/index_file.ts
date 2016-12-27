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

import { FindResult, IndexRecord } from './wordnet_types';
import WordNetFile = require('./wordnet_file');
import fs = require('fs');

function getFileSize(path: string | Buffer) {
  var stat = fs.statSync(path);
  return stat.size;
}

function findPrevEOL(fd: number, pos: number, callback: (pos: number) => void) {
  var buff = new Buffer(1024);
  if(pos == 0)
    callback(0);
  else {
    fs.read(fd, buff, 0, 1, pos, function(err, count) {
      if(buff[0] == 10)
        callback(pos + 1);
      else
        findPrevEOL(fd, pos - 1, callback);
    });
  }
}

function readLine(fd: number, pos: number, callback: (line: string) => void) {
  var buff = new Buffer(1024);
  findPrevEOL(fd, pos, function(pos) {
    WordNetFile.appendLineChar(fd, pos, 0, buff, callback);
  });
}

function miss(callback: (result: FindResult) => void) {
  callback({status: 'miss'});
}

class IndexFile extends WordNetFile {
    constructor(dataDir: string, name: string) {
        super(dataDir, 'index.' + name);
    }

    private findAt(fd: number, size: number, pos: number, lastPos: number | null, adjustment: number, searchKey: string, callback: (result: FindResult) => void, lastKey?: string) {
        if (lastPos == pos || pos >= size) {
            miss(callback);
        } else {
            readLine(fd, pos, line => {
                var tokens = line.split(/\s+/);
                var key = tokens[0];

                if(key == searchKey) {
                    callback({status: 'hit', key: key, 'line': line, tokens: tokens});
                } else if(adjustment == 1 || key == lastKey)  {
                    miss(callback);
                } else {
                    adjustment = Math.ceil(adjustment * 0.5);

                    if (key < searchKey) {
                        this.findAt(fd, size, pos + adjustment, pos, adjustment, searchKey, callback, key);
                    } else {
                        this.findAt(fd, size, pos - adjustment, pos, adjustment, searchKey, callback, key);
                    }
                }
            });
        }
    }


    find(searchKey: string, callback: (result: FindResult) => void) {
        this.open((err, fd, done) => {
            if(err) {
                console.log(err);
            } else {
                var size = getFileSize(this.filePath) - 1;
                var pos = Math.ceil(size / 2);
                this.findAt(fd, size, pos, null, pos, searchKey,
                       function(result) { callback(result); done(); });
            }
        });
    }

    lookup(word: string, callback: (record: IndexRecord | null) => void) {
        this.find(word, function(record) {
            var indexRecord = null;

            if(record.status == 'hit') {
                var ptrs = [], offsets = [];

                for(var i = 0; i < parseInt(record.tokens[3]); i++)
                    ptrs.push(record.tokens[i]);

                for(var i = 0; i < parseInt(record.tokens[2]); i++)
                    offsets.push(parseInt(record.tokens[ptrs.length + 6 + i], 10));

                indexRecord = {
                    lemma: record.tokens[0],
                    pos: record.tokens[1],
                    ptrSymbol: ptrs,
                    senseCnt:  parseInt(record.tokens[ptrs.length + 4], 10),
                    tagsenseCnt:  parseInt(record.tokens[ptrs.length + 5], 10),
                    synsetOffset:  offsets
                };
            }
            indexRecord;

            callback(indexRecord);
        });
    }
}

export = IndexFile;

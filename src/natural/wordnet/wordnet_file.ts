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

import fs = require('fs');
import path = require('path');

class WordNetFile {
    dataDir: string;
    fileName: string;
    filePath: string;
    constructor(dataDir: string, fileName: string) {
        this.dataDir = dataDir;
        this.fileName = fileName;
        this.filePath = path.join(this.dataDir, this.fileName);
    }
    open(callback: (err: NodeJS.ErrnoException, fd: number, k: () => void) => void) {
        var filePath = this.filePath;

        fs.open(filePath, 'r', function(err, fd) {
            if (err) {
                console.log('Unable to open %s', filePath);
                return;
            }
            callback(err, fd, function() {fs.close(fd)});
        });
    }
    static appendLineChar(fd: number, pos: number, buffPos: number, buff: Buffer, callback: (s: string) => void) {
        if(buffPos >= buff.length) {
            var newBuff = new Buffer(buff.length * 2);
            buff.copy(newBuff, 0, 0, buff.length);
            buff = newBuff;
        }

        fs.read(fd, buff, buffPos, 1, pos, function(err, count) {
            if(err)
                console.log(err);
            else {
                if(buff[buffPos] == 10 || buffPos == buff.length)
                    callback(buff.slice(0, buffPos).toString('UTF-8'));
                else {
                    WordNetFile.appendLineChar(fd, pos + 1, buffPos + 1, buff, callback);
                }
            }
        });
    }
}

export = WordNetFile;

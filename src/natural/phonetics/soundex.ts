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

import { Phonetic, createPhonetic } from './phonetic';

function transformLipps(token: string) {
    return token.replace(/[bfpv]/g, '1');
}

function transformThroats(token: string) {
    return token.replace(/[cgjkqsxz]/g, '2');
}

function transformToungue(token: string) {
    return token.replace(/[dt]/g, '3');
}

function transformL(token: string) {
    return token.replace(/l/g, '4');
}

function transformHum(token: string) {
    return token.replace(/[mn]/g, '5');
}

function transformR(token: string) {
    return token.replace(/r/g, '6');
}

function condense(token: string) {
    return token.replace(/(\d)?\1+/g, '$1');
}

function padRight0(token: string) {
    if(token.length < 4)
        return token + Array(4 - token.length).join('0');
    else
        return token;
}

function transform(token: string) {
    return transformLipps(transformThroats(
        transformToungue(transformL(transformHum(transformR(token))))));
}
interface SoundEx extends Phonetic {
    transformLipps(token: string): string;
    transformThroats(token: string): string;
    transformToungue(token: string): string;
    transformL(token: string): string;
    transformHum(token: string): string;
    transformR(token: string): string;
    condense(token: string): string;
    padRight0(token: string): string;
}

var SoundEx = createPhonetic(process) as SoundEx;
export = SoundEx;

function process(token: string, maxLength: number) {
    token = token.toLowerCase();    
    var transformed = condense(transform(token.substr(1, token.length - 1))); // anything that isn't a digit goes
    // deal with duplicate INITIAL consonant SOUNDS
    transformed = transformed.replace(new RegExp("^" + transform(token.charAt(0))), '');
    return token.charAt(0).toUpperCase() + padRight0(transformed.replace(/\D/g, '')).substr(0, (maxLength && maxLength - 1) || 3);
};

// export for tests;
SoundEx.transformLipps = transformLipps;
SoundEx.transformThroats = transformThroats;
SoundEx.transformToungue = transformToungue;
SoundEx.transformL = transformL;
SoundEx.transformHum = transformHum;
SoundEx.transformR = transformR;
SoundEx.condense = condense;
SoundEx.padRight0 = padRight0;

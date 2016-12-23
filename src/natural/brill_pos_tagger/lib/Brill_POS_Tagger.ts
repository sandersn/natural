/*
    Brill's POS Tagger
    Copyright (C) 2016 Hugo W.L. ter Doest

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

import log4js = require('log4js');
var logger = log4js.getLogger();

import fs = require("fs");

import TF_Parser = require('./TF_Parser');

logger.setLevel('WARN');

class Brill_POS_Tagger {
    constructor(public lexicon: { tagWord(s: string): string[] }, public ruleSet: { rules: any[] }) {
    }

    // Tags a sentence, sentence is an array of words
    // Returns an array of tagged words; a tagged words is an array consisting of
    // the word itself followed by its lexical category
    tag(sentence: string[]) {
        var taggedSentence: [string, string][] = new Array(sentence.length);
        
        var that = this;
        sentence.forEach(function(word, index) {
            var categories = that.lexicon.tagWord(word);
            taggedSentence[index] = [word, categories[0]];
        });

        // Apply transformation rules
        for (var i = 0, size = sentence.length; i < size; i++) {
            this.ruleSet.rules.forEach(function(rule) {
                rule.apply(taggedSentence, i);
            });
        }
        return(taggedSentence);
    }


}
export = Brill_POS_Tagger;

/*
   Lexicon class
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

import fs = require('fs');
import log4js = require('log4js');
var logger = log4js.getLogger();

// Parses a lexicon in JSON or text format
class Lexicon {
    defaultCategory;
    lexicon;
    constructor(filename, defaultCategory) {
        this.defaultCategory = defaultCategory;

        // Read lexicon
        try {
            var data = fs.readFileSync(filename, 'utf8');
            if (data[0] === "{") {
                // Lexicon is in JSON format
                this.lexicon = JSON.parse(data);
            }
            else {
                // Lexicon is plain text
                this.parseLexicon(data);
            }
            logger.debug('Brill_POS_Tagger.read_lexicon: number of lexicon entries read: ' + Object.keys(this.lexicon).length);
        }
        catch(error) {
            logger.error(error);
        }
    }

    // Parses a lexicon in text format: word cat1 cat2 ... catn
    parseLexicon(data) {
        // Split into an array of non-empty lines
        var arrayOfLines = data.match(/[^\r\n]+/g);
        this.lexicon = {};
        for (const line of arrayOfLines) {
            // Split line by whitespace
            var elements = line.trim().split(/\s+/);
            if (elements.length > 0) {
                this.lexicon[elements[0]] = elements.slice(1);
            }
        }
    };

    // Returns a list of categories for word
    tagWord(word) {
        var categories = this.lexicon[word];
        if (!categories) {
            categories = this.lexicon[word.toLowerCase()];
        }
        if (!categories) {
            // If not found assign default_category
            categories = [this.defaultCategory];
        }
        return(categories);
    }
}

export = Lexicon;

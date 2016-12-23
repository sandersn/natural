/*
    Transformation rules for the Brill tagger
    Copyright (C) 2015 Hugo W.L. ter Doest

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

import Predicate = require("./Predicate");

logger.setLevel('ERROR');

var category_wild_card = "*";

class TransformationRule {
    literal: string[];
    predicate: Predicate;
    old_category: string;
    new_category: string;
    constructor(c1: string, c2: string, predicate: string, parameter1: string, parameter2: string) {
        this.literal = [c1, c2, predicate, parameter1, parameter2];
        this.predicate = new Predicate(predicate, parameter1, parameter2);
        this.old_category = c1;
        this.new_category = c2;
        logger.debug('TransformationRule constructor: ' + this.literal);
    }

    apply(tagged_sentence: [string, string][], position: number) {
        if ((tagged_sentence[position][1] === this.old_category) ||
            (this.old_category === category_wild_card)) {
            if (this.predicate.evaluate(tagged_sentence, position)) {
                tagged_sentence[position][1] = this.new_category;
                logger.debug('TransformationRule.apply: changed category ' + 
                             this.old_category + ' to ' + this.new_category +
                             ' at position ' + position);
            }
        }
    }
}

export = TransformationRule;
  

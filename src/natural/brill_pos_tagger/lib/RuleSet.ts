/*
   Set of transformation rules
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

class RuleSet {
    rules: any[];
    constructor(filename: string) {
        // Read transformation rules
        try {
            var data = fs.readFileSync(filename, 'utf8');
            this.rules = TF_Parser.parse(data);
            logger.debug(this.rules.toString());
            logger.debug('Brill_POS_Tagger.read_transformation_rules: number of transformation rules read: ' + this.rules.length);
        }
        catch(error) {
            logger.error(error);
        }
    }
}

export = RuleSet;

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

function uppercaseify(token: string) {
    return token.toUpperCase();
}
function capitalize(token: string) {
    return token[0].toUpperCase() + token.slice(1);
}
function lowercaseify(token: string) {
    return token.toLowerCase();
}

interface Forms {
    regularForms: [RegExp, string | ((sub: string, ...args: any[]) => string)][];
    irregularForms: { [s: string]: string };
}

class TenseInflector {
    singularForms: Forms;
    pluralForms: Forms;
    customSingularForms: [RegExp, string][];
    customPluralForms: [RegExp, string][];
    ambiguous: string[];

    addSingular(pattern: RegExp, replacement: string) {
        this.customSingularForms.push([pattern, replacement]);
    };

    addPlural(pattern: RegExp, replacement: string) {
        this.customPluralForms.push([pattern, replacement]);
    };

    ize(token: string, formSet: Forms, customForms: [RegExp, string][]) {
        const restoreCase = this.restoreCase(token);
        return restoreCase(this.izeRegExps(token, customForms) ||
                           this.izeAbiguous(token) ||
                           this.izeRegulars(token, formSet) ||
                           this.izeRegExps(token, formSet.regularForms) ||
                           token);
    }

    izeAbiguous(token: string) {
        if (this.ambiguous.indexOf(token.toLowerCase()) > -1)
            return token.toLowerCase();

        return false;
    }

    pluralize(token: string) {
        return this.ize(token, this.pluralForms, this.customPluralForms);
    }

    singularize(token: string) {
        return this.ize(token, this.singularForms, this.customSingularForms);
    }

    restoreCase(token: string) {
        if (token[0] === token[0].toUpperCase()) {
            if (token[1] && token[1] === token[1].toLowerCase()) {
                return capitalize;
            } else {
                return uppercaseify;
            }
        } else {
            return lowercaseify;
        }
    }

    izeRegulars(token: string, formSet: Forms) {
        token = token.toLowerCase();
        if (formSet.irregularForms.hasOwnProperty(token) && formSet.irregularForms[token])
            return formSet.irregularForms[token];

        return false;
    }

    addForm(singularTable: { [s: string]: string }, pluralTable: { [s: string]: string }, singular: string, plural: string) {
        singular = singular.toLowerCase();
        plural = plural.toLowerCase();
        pluralTable[singular] = plural;
        singularTable[plural] = singular;
    };

    addIrregular(singular: string, plural: string) {
        this.addForm(this.singularForms.irregularForms, this.pluralForms.irregularForms, singular, plural);
    };

    izeRegExps(token: string, forms: [RegExp, string | ((sub: string, ...args: any[]) => string)][]) {
        for (const [pattern, replacement] of forms) {
            if (token.match(pattern)) {
                return token.replace(pattern, replacement as string);
            }
        }

        return false;
    }
};

export = TenseInflector;

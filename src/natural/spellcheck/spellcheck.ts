import Trie = require('../trie/trie');

// Probabilistic spellchecker based on http://norvig.com/spell-correct.html
// The general idea is simple. Given a word, the spellchecker calculates all strings that are some user-defined edit distance away. Of those many candidates, it filters the ones that are not words and then returns an array of possible corrections in order of decreasing probability, based on the edit distance and the candidate's frequency in the input corpus
// Words that are an edit distance of n away from the mispelled word are considered infinitely more probable than words that are of an edit distance >n

// wordlist is a corpus (an array) from which word probabilities are calculated (so something like /usr/share/dict/words (on OSX) will work okay, but real world text will work better)
class Spellcheck {
    trie: Trie;
    word2frequency: { [s: string]: number };
    edits = edits; // for unit testing
    editsWithMaxDistance = editsWithMaxDistance; // for unit testing
    constructor(wordlist: string[]) {
        this.trie = new Trie();
        this.trie.addStrings(wordlist);
        this.word2frequency = {};
        for(const word of wordlist) {
            if(!this.word2frequency[word]) {
                this.word2frequency[word] = 0;
            }
            this.word2frequency[word]++;
        }
    }

    isCorrect(word: string) {
        return this.trie.contains(word);
    }

    // Returns a list of suggested corrections, from highest to lowest probability
    // maxDistance is the maximum edit distance
    // According to Norvig, literature suggests that 80% to 95% of spelling errors are an edit distance of 1 away from the correct word. This is good, because there are roughly 54n+25 strings 1 edit distance away from any given string of length n. So after maxDistance = 2, this becomes very slow.
    getCorrections(word: string, maxDistance: number) {
        if(!maxDistance) maxDistance = 1;
        var edits = editsWithMaxDistance(word, maxDistance);
        edits = edits.slice(1,edits.length);
        edits = edits.map(editList =>
            editList.filter(word => this.isCorrect(word))
                .map(word => [word, this.word2frequency[word]] as [string, number])
                .sort(function([w1,score1],[w2,score2]) { return score1 > score2 ? -1 : 1; })
                .map(([word,score]) => word));
        var flattened: string[] = [];
        for(const edit of edits) {
            if(edit.length) flattened = flattened.concat(edit);
        }
        return flattened.filter((v, i, a) => a.indexOf(v) == i);
    }
}

/** Returns all edits that are up to "distance" edit distance away from the input word */
function editsWithMaxDistance(word: string, distance: number) {
    return editsWithMaxDistanceHelper(distance, [[word]]);
}

function editsWithMaxDistanceHelper(distanceCounter: number, distance2edits: string[][]): string[][] {
    if(distanceCounter == 0) return distance2edits;
    var currentDepth = distance2edits.length-1;
    var words = distance2edits[currentDepth];
    distance2edits[currentDepth+1] = concatMap(words, edits);
    return editsWithMaxDistanceHelper(distanceCounter-1, distance2edits);
}

/** Returns all edits that are 1 edit-distance away from the input word */
function edits(word: string) {
    var alphabet = 'abcdefghijklmnopqrstuvwxyz';
    var edits = [];
    for(var i=0; i<word.length+1; i++) {
        if(i>0) edits.push(word.slice(0,i-1)+word.slice(i,word.length)); // deletes
        if(i>0 && i<word.length+1) edits.push(word.slice(0,i-1) + word[i] + word[i-1] + word.slice(i+1,word.length)); // transposes
        for(var k=0; k<alphabet.length; k++) {
            if(i>0) edits.push(word.slice(0,i-1)+alphabet[k]+word.slice(i,word.length)); // replaces
            edits.push(word.slice(0,i)+alphabet[k]+word.slice(i,word.length)); // inserts
        }
    }
    // Deduplicate edits
    edits = edits.filter((v, i, a) => a.indexOf(v) == i);
    return edits;
}

/** aka bind, liftM, pure, flatMap, and so on */
function concatMap<T>(ts: T[], f: (t: T) => T[]): T[] {
    const result = [];
    for (const t of ts)
        for (const out of f(t))
            result.push(out);
    return result;
}

export = Spellcheck;

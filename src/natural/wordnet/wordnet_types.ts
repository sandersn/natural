export type WordnetData = {
    synsetOffset: number;
    lexFilenum: number;
    pos: string;
    wCnt: number;
    lemma: string;
    synonyms: string[];
    lexId: string;
    ptrs: Pointer[];
    gloss: string;
    def: string;
    exp: string[];
}

export type Pointer = {
    pointerSymbol: string;
    synsetOffset: number;
    pos: Pos;
    sourceTarget: string;
}

type HitResult = {
    status: 'hit';
    key: string;
    line: string;
    tokens: string[]
}
type MissResult = {
    status: 'miss';
}
export type FindResult = HitResult | MissResult;

export type IndexRecord = {
    lemma: string;
    pos: string;
    ptrSymbol: string[];
    senseCnt: number;
    tagsenseCnt: number;
    synsetOffset: number[];
}

export type Pos = 'n' | 'v' | 'a' | 's' | 'r';

import { Words } from "./word-list";

export function isValidWord(word: string): boolean {
    return Words.includes(word.toUpperCase());
}

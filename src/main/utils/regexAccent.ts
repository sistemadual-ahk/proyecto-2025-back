// src/utils/regexAccent.ts
export function accentInsensitiveRegex(value: string) {
    // 1️⃣ Normalize accents
    let normalized = value.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    // 2️⃣ Remove punctuation and spaces for flexibility
    normalized = normalized.replace(/[\s.\-_,']/g, ""); // removes spaces, dots, dashes, commas, etc.

    // 3️⃣ Expand vowels to handle accented DB values
    const accentFold = (word: string) => word.replace(/a/gi, "[aáàäâAÁÀÄÂ]").replace(/e/gi, "[eéèëêEÉÈËÊ]").replace(/i/gi, "[iíìïîIÍÌÏÎ]").replace(/o/gi, "[oóòöôOÓÒÖÔ]").replace(/u/gi, "[uúùüûUÚÙÜÛ]");

    // 4️⃣ Create regex that ignores spaces and punctuation *in the DB value too*
    // Use \s*[\.\-_,']?\s* between each letter to allow arbitrary spacing/punctuation.
    const pattern = normalized
        .split("")
        .map((char) => (/[a-zA-Z]/.test(char) ? accentFold(char) : char))
        .join("[\\s\\.,\\-_'’]*"); // allow these chars between any letters

    return new RegExp(pattern, "i");
}
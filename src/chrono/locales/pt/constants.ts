import { OpUnitType, QUnitType } from "dayjs";
import { matchAnyPattern } from "src/chrono/utils/pattern";
import { TimeUnits } from "src/chrono/utils/timeunits";

export const WEEKDAY_DICTIONARY: { [word: string]: number } = {
    "domingo": 0,
    "dom": 0,
    "segunda": 1,
    "segunda-feira": 1,
    "seg": 1,
    "terça": 2,
    "terça-feira": 2,
    "ter": 2,
    "quarta": 3,
    "quarta-feira": 3,
    "qua": 3,
    "quinta": 4,
    "quinta-feira": 4,
    "qui": 4,
    "sexta": 5,
    "sexta-feira": 5,
    "sex": 5,
    "sábado": 6,
    "sabado": 6,
    "sab": 6,
};

export const MONTH_DICTIONARY: { [word: string]: number } = {
    "janeiro": 1,
    "jan": 1,
    "jan.": 1,
    "fevereiro": 2,
    "fev": 2,
    "fev.": 2,
    "março": 3,
    "mar": 3,
    "mar.": 3,
    "abril": 4,
    "abr": 4,
    "abr.": 4,
    "maio": 5,
    "mai": 5,
    "mai.": 5,
    "junho": 6,
    "jun": 6,
    "jun.": 6,
    "julho": 7,
    "jul": 7,
    "jul.": 7,
    "agosto": 8,
    "ago": 8,
    "ago.": 8,
    "setembro": 9,
    "set": 9,
    "set.": 9,
    "outubro": 10,
    "out": 10,
    "out.": 10,
    "novembro": 11,
    "nov": 11,
    "nov.": 11,
    "dezembro": 12,
    "dez": 12,
    "dez.": 12,
};

export const TIME_UNIT_DICTIONARY: { [word: string]: OpUnitType | QUnitType } = {
    s: "second",
    seg: "second",
    segundo: "second",
    segundos: "second",
    m: "minute",
    min: "minute",
    mins: "minute",
    minuto: "minute",
    minutos: "minute",
    h: "hour",
    hr: "hour",
    hrs: "hour",
    hora: "hour",
    horas: "hour",
    d: "d",
    dia: "d",
    dias: "d",
    sem: "w",
    semana: "week",
    semanas: "week",
    mes: "month",
    mês: "month",
    meses: "month",
    qrt: "quarter",
    quarto: "quarter",
    quartos: "quarter",
    a: "year",
    ano: "year",
    anos: "year"
};

export const INTEGER_WORD_DICTIONARY: { [word: string]: number } = {
    um: 1,
    dois: 2,
    três: 3,
    quatro: 4,
    cinco: 5,
    seis: 6,
    sete: 7,
    oito: 8,
    nove: 9,
    dez: 10,
    onze: 11,
    doze: 12,
};

//-----------------------------
// 88 p. Chr. n.
// 234 AC
export const YEAR_PATTERN = "[0-9]{1,4}(?![^\\s]\\d)(?:\\s*[a|d]\\.?\\s*c\\.?|\\s*a\\.?\\s*d\\.?)?";
export function parseYear(match: string): number {
    if (match.match(/^[0-9]{1,4}$/)) {
        let yearNumber = parseInt(match);
        if (yearNumber < 100) {
            if (yearNumber > 50) {
                yearNumber = yearNumber + 1900;
            } else {
                yearNumber = yearNumber + 2000;
            }
        }
        return yearNumber;
    }

    if (match.match(/a\.?\s*c\.?/i)) {
        match = match.replace(/a\.?\s*c\.?/i, "");
        return -parseInt(match);
    }

    return parseInt(match);
}



export const NUMBER_PATTERN = `(?:${matchAnyPattern(
    INTEGER_WORD_DICTIONARY
)}|[0-9]+|[0-9]+\\.[0-9]+|half(?:\\s{0,2}an?)?|an?\\b(?:\\s{0,2}few)?|few|several|the|a?\\s{0,2}couple\\s{0,2}(?:of)?)`;
const SINGLE_TIME_UNIT_PATTERN = `(${NUMBER_PATTERN})\\s{0,3}(${matchAnyPattern(TIME_UNIT_DICTIONARY)})`;
const SINGLE_TIME_UNIT_REGEX = new RegExp(SINGLE_TIME_UNIT_PATTERN, "i");

export function parseTimeUnits(timeunitText: string): TimeUnits {
    const fragments = {};
    let remainingText = timeunitText;
    let match = SINGLE_TIME_UNIT_REGEX.exec(remainingText);
    while (match) {
        collectDateTimeFragment(fragments, match);
        remainingText = remainingText.substring(match[0].length).trim();
        match = SINGLE_TIME_UNIT_REGEX.exec(remainingText);
    }
    return fragments;
}

function collectDateTimeFragment(fragments: { [x: string]: number; }, match: string[]) {
    const num = parseNumberPattern(match[1]);
    const unit = TIME_UNIT_DICTIONARY[match[2].toLowerCase()];
    fragments[unit] = num;
}

export function parseNumberPattern(match: string): number {
    const num = match.toLowerCase();
    if (INTEGER_WORD_DICTIONARY[num] !== undefined) {
        return INTEGER_WORD_DICTIONARY[num];
    } else if (num === "a" || num === "an" || num == "the") {
        return 1;
    } else if (num.match(/few/)) {
        return 3;
    } else if (num.match(/half/)) {
        return 0.5;
    } else if (num.match(/couple/)) {
        return 2;
    } else if (num.match(/several/)) {
        return 7;
    }

    return parseFloat(num);
}
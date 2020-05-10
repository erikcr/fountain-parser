/**
 * Regex definitions
 */
export const TITLE_PAGE = /^((?:title|credit|author[s]?|source|notes|draft date|date|contact|copyright):)/gim;

export const SCENE_HEADING = /^((?:\*{0,3}_?)?(?:(?:int|ext|est|i\/e)[. ]).+)|^(?:\.(?!\.+))(.+)/i;
export const SCENE_NUMBER = /( *#(.+)# *)/;

export const TRANSITION = /^((?:FADE (?:TO BLACK|OUT)|CUT TO BLACK)\.|.+ TO\:)|^(?:> *)(.+)/;

export const DIALOGUE = /^([A-Z*_]+[0-9A-Z (._\-')]*)(\^?)?(?:\n(?!\n+))([\s\S]+)/;
export const PARENTHETICAL = /^(\(.+\))$/;

export const ACTION = /^(.+)/g;
export const CENTERED = /^(?:> *)(.+)(?: *<)(\n.+)*/g;

export const SECTION = /^(#+)(?: *)(.*)/;
export const SYNOPSIS = /^(?:\=(?!\=+) *)(.*)/;

export const NOTE = /^(?:\[{2}(?!\[+))(.+)(?:\]{2}(?!\[+))$/;
export const NOTE_INLINE = /(?:\[{2}(?!\[+))([\s\S]+?)(?:\]{2}(?!\[+))/g;
export const BONEYARD = /(^\/\*|^\*\/)$/g;

export const PAGE_BREAK = /^\={3,}$/;
export const LINE_BREAK = /^ {2}$/;

export const EMPHASIS = /(_|\*{1,3}|_\*{1,3}|\*{1,3}_)(.+)(_|\*{1,3}|_\*{1,3}|\*{1,3}_)/g;
export const BOLD_ITALIC_UNDERLINE = /(_{1}\*{3}(?=.+\*{3}_{1})|\*{3}_{1}(?=.+_{1}\*{3}))(.+?)(\*{3}_{1}|_{1}\*{3})/g;
export const BOLD_UNDERLINE = /(_{1}\*{2}(?=.+\*{2}_{1})|\*{2}_{1}(?=.+_{1}\*{2}))(.+?)(\*{2}_{1}|_{1}\*{2})/g;
export const ITALIC_UNDERLINE = /(?:_{1}\*{1}(?=.+\*{1}_{1})|\*{1}_{1}(?=.+_{1}\*{1}))(.+?)(\*{1}_{1}|_{1}\*{1})/g;
export const BOLD_ITALIC = /(\*{3}(?=.+\*{3}))(.+?)(\*{3})/g;
export const BOLD = /(\*{2}(?=.+\*{2}))(.+?)(\*{2})/g;
export const ITALIC = /(\*{1}(?=.+\*{1}))(.+?)(\*{1})/g;
export const UNDERLINE = /(_{1}(?=.+_{1}))(.+?)(_{1})/g;

export const SPLITTER = /\n{2,}/g;
export const CLEANER = /^\n+|\n+$/;
export const STANDARDIZER = /\r\n|\r/g;
export const WHITESPACER = /^\t+|^ {3,}/gm;

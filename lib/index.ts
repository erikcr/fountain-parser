import * as fs from "fs";
import * as path from "path";
import * as regex from "./regex";

const lexer = (script: string) => {
  return script
    .replace(regex.BONEYARD, "\n$1\n")
    .replace(regex.STANDARDIZER, "\n")
    .replace(regex.CLEANER, "")
    .replace(regex.WHITESPACER, "");
};

export const tokenize = (script: string) => {
  const src = lexer(script).split(regex.SPLITTER);
  let i = src.length,
    line,
    match,
    parts,
    text,
    meta,
    dual;
  let tokens = [];

  while (i--) {
    line = src[i];

    // TITLE_PAGE
    if (regex.TITLE_PAGE.test(line)) {
      match = line
        .replace(regex.TITLE_PAGE, "\n$1")
        .split(regex.SPLITTER)
        .reverse();

      for (let x = 0; x < match.length; x++) {
        parts = match[x].replace(regex.CLEANER, "").split(/\:\n*/);
        tokens.push({
          type: parts[0].trim().toLowerCase().replace(" ", "_"),
          text: parts[1].trim(),
        });
      }
      continue;
    }

    // SCENE_HEADING
    if ((match = line.match(regex.SCENE_HEADING))) {
      text = match[1] || match[2];

      if (text.indexOf("  ") !== text.length - 2) {
        if ((meta = text.match(regex.SCENE_NUMBER))) {
          meta = meta[2];
          text = text.replace(regex.SCENE_NUMBER, "");
        }
        tokens.push({
          type: "SCENE_HEADING",
          text: text,
          scene_number: meta || undefined,
        });
      }
      continue;
    }

    // CENTERED
    if ((match = line.match(regex.CENTERED))) {
      tokens.push({ type: "CENTERED", text: match[0].replace(/>|</g, "") });
      continue;
    }

    // TRANSITION
    if ((match = line.match(regex.TRANSITION))) {
      tokens.push({ type: "TRANSITION", text: match[1] || match[2] });
      continue;
    }

    // DIALOGUE - characters, parentheticals and dialogue
    if ((match = line.match(regex.DIALOGUE))) {
      if (match[1].indexOf("  ") !== match[1].length - 2) {
        // we're iterating from the bottom up, so we need to push these backwards
        if (match[2]) {
          tokens.push({ type: "DUAL_DIALOGUE_END" });
        }

        tokens.push({ type: "DIALOGUE_END" });

        parts = match[3].split(/(\(.+\))(?:\n+)/).reverse();

        for (let x = 0; x < parts.length; x++) {
          text = parts[x];

          if (text.length > 0) {
            tokens.push({
              type: regex.PARENTHETICAL.test(text)
                ? "PARENTHETICAL"
                : "DIALOGUE",
              text: text,
            });
          }
        }

        tokens.push({ type: "CHARACTER", text: match[1].trim() });
        tokens.push({
          type: "DIALOGUE_BEGIN",
          dual: match[2] ? "RIGHT" : dual ? "LEFT" : undefined,
        });

        if (dual) {
          tokens.push({ type: "DUAL_DIALOGUE_BEGIN" });
        }

        dual = match[2] ? true : false;
        continue;
      }
    }

    // SECTION
    if ((match = line.match(regex.SECTION))) {
      tokens.push({ type: "SECTION", text: match[2], depth: match[1].length });
      continue;
    }

    // SYNOPSIS
    if ((match = line.match(regex.SYNOPSIS))) {
      tokens.push({ type: "SYNOPSIS", text: match[1] });
      continue;
    }

    // NOTE
    if ((match = line.match(regex.NOTE))) {
      tokens.push({ type: "NOTE", text: match[1] });
      continue;
    }

    // BONEYARD
    if ((match = line.match(regex.BONEYARD))) {
      tokens.push({
        type: match[0][0] === "/" ? "BONEYARD_BEGIN" : "BONEYARD_END",
      });
      continue;
    }

    // PAGE_BREAK
    if (regex.PAGE_BREAK.test(line)) {
      tokens.push({ type: "PAGE_BREAK" });
      continue;
    }

    // LINE_BREAK
    if (regex.LINE_BREAK.test(line)) {
      tokens.push({ type: "LINE_BREAK" });
      continue;
    }

    tokens.push({ type: "ACTION", text: line });
  }

  return tokens;
};

export const fountain = (script: string) => {
  const tokens = tokenize(script);

  console.log(tokens);
};

const script = fs.readFileSync(
  path.join(__dirname, "../samples/big_fish.fountain"),
  "utf8"
);
fountain(script);

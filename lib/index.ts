import { v4 as uuidv4 } from "uuid";
import * as regex from "./regex";
import { IFountainFile, IBlock, IScene } from "./types";

export class Trevi implements IFountainFile {
  input = "";
  authors = "";
  contact = "";
  copyright = "";
  credit = "";
  date = "";
  draftDate = "";
  notes = "";
  source = "";
  title = "";
  blocks: Array<IBlock> = [];
  scenes: Array<IScene> = [];

  constructor(input: string) {
    this.tokenize(input);
  }

  lexer(input: string) {
    return input
      .replace(regex.BONEYARD, "\n$1\n")
      .replace(regex.STANDARDIZER, "\n")
      .replace(regex.CLEANER, "")
      .replace(regex.WHITESPACER, "");
  }

  tokenize(input: string) {
    const src = this.lexer(input).split(regex.SPLITTER);

    let i = src.length;
    let id, line, match, text, parts, dual, name;
    let blockIds: Array<string> = [];

    while (i--) {
      line = src[i];

      // Title Page
      if (regex.TITLE_PAGE.test(line)) {
        match = line
          .replace(regex.TITLE_PAGE, "\n$1")
          .split(regex.SPLITTER)
          .reverse();

        for (let x = 0; x < match.length; x++) {
          parts = match[x].replace(regex.CLEANER, "").split(/\:\n*/);

          const partType = parts[0].trim();

          if (partType.match(regex.AUTHOR)) {
            this.authors = parts[1].trim();
          } else if (partType.match(regex.CONTACT)) {
            this.contact = parts[1].trim();
          } else if (partType.match(regex.COPYRIGHT)) {
            this.copyright = parts[1].trim();
          } else if (partType.match(regex.CREDIT)) {
            this.credit = parts[1].trim();
          } else if (partType.match(regex.DATE)) {
            this.date = parts[1].trim();
          } else if (partType.match(regex.DRAFT_DATE)) {
            this.draftDate = parts[1].trim();
          } else if (partType.match(regex.NOTES)) {
            this.notes = parts[1].trim();
          } else if (partType.match(regex.SOURCE)) {
            this.source = parts[1].trim();
          } else if (partType.match(regex.TITLE)) {
            this.title = parts[1].trim();
          }
        }

        continue;
      }

      // Slugline
      if ((match = line.match(regex.SLUGLINE))) {
        id = uuidv4();
        blockIds.push(id);
        text = match[1] || match[2];

        this.blocks.push({
          id,
          type: "SLUGLINE",
          text,
        });

        blockIds.reverse();
        this.scenes.push({
          number: -1,
          blockIds,
        });
        blockIds = [];

        continue;
      }

      // Dialogue Blocks - characters, parentheticals and dialogue
      if ((match = line.match(regex.DIALOGUE))) {
        if (match[1].indexOf("  ") !== match[1].length - 2) {
          parts = match[3].split(/(\(.+\))(?:\n+)/).reverse();

          for (let x = 0; x < parts.length; x++) {
            id = uuidv4();
            blockIds.push(id);
            text = parts[x];

            if (text.length > 0) {
              let type = regex.PARENTHETICAL.test(text)
                ? "PARENTHETICAL"
                : "DIALOGUE";

              if (type === "DIALOGUE") {
                type += match[2] ? "_RIGHT" : dual ? "_LEFT" : "";
              }

              this.blocks.push({
                id,
                type,
                text,
              });
            }
          }

          id = uuidv4();
          blockIds.push(id);
          this.blocks.push({ id, type: "CHARACTER", text: match[1].trim() });

          dual = match[2];
          continue;
        }
      }

      // Action
      if (regex.ACTION) {
        id = uuidv4();
        blockIds.push(id);
        this.blocks.push({ id, type: "ACTION", text: line });

        continue;
      }

      // Centered
      if ((match = line.match(regex.CENTERED))) {
        id = uuidv4();
        blockIds.push(id);
        this.blocks.push({ id, type: "CENTERED", text: match[0] });

        continue;
      }

      // Transition
      if ((match = line.match(regex.TRANSITION))) {
        id = uuidv4();
        blockIds.push(id);
        this.blocks.push({ id, type: "TRANSITION", text: match[0] });

        continue;
      }

      // Section
      if ((match = line.match(regex.SECTION))) {
        id = uuidv4();
        blockIds.push(id);
        this.blocks.push({ id, type: "SECTION", text: match[2] });

        continue;
      }

      // Synopsis
      if ((match = line.match(regex.SYNOPSIS))) {
        id = uuidv4();
        blockIds.push(id);
        this.blocks.push({ id, type: "SYNOPSIS", text: match[1] });

        continue;
      }

      // Note
      if ((match = line.match(regex.NOTE))) {
        id = uuidv4();
        blockIds.push(id);
        this.blocks.push({ id, type: "NOTE", text: match[1] });

        continue;
      }

      // Boneyard
      if ((match = line.match(regex.BONEYARD))) {
        id = uuidv4();
        blockIds.push(id);
        this.blocks.push({
          id,
          type: match[0][0] === "/" ? "BONEYARD_BEGIN" : "BONEYARD_END",
        });

        continue;
      }

      // Page Break
      if (regex.PAGE_BREAK.test(line)) {
        id = uuidv4();
        blockIds.push(id);
        this.blocks.push({ id, type: "PAGE_BREAK" });

        continue;
      }

      // Line Break
      if (regex.LINE_BREAK.test(line)) {
        id = uuidv4();
        blockIds.push(id);
        this.blocks.push({ id, type: "LINE_BREAK" });

        continue;
      }
    }

    this.blocks.reverse();
    this.scenes.reverse();

    for (let x = 0; x < this.scenes.length; x++) {
      this.scenes[x].number = x + 1;
    }
  }
}

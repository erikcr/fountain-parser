import { v4 as uuidv4 } from "uuid";
import * as regex from "./regex";

interface IAction {
  id: string;
  text: string;
}

interface ICharacter {
  name: string;
  id: string;
  sceneId: string;
}

interface IDialogueBlock {
  characterId: string;
  dialogue: string;
  dual?: string;
  id: string;
  parenthetical: string;
  sceneId: string;
}

interface IScene {
  number?: number;
  id: string;
  heading: string;
}

interface IDetails {
  authors: string;
  contact: string;
  copyright: string;
  credit: string;
  date: string;
  draftDate: string;
  id: string;
  notes: string;
  source: string;
  title: string;
}

interface IToken {
  id?: string;
  type: string;
  text?: string;
}

interface IScript {
  // Fields
  actions: Array<IAction>;
  characters: Array<ICharacter>;
  details: IDetails;
  dialogueBlocks: Array<IDialogueBlock>;
  input: string;
  scenes: Array<IScene>;
  tokens: Array<IToken>;
  // Methods
  getCharacters: () => Array<ICharacter>;
  getDetails: () => IDetails;
  getDialogueBlocks: () => Array<IDialogueBlock>;
  getScenes: () => Array<IScene>;
  getTokens: () => Array<IToken>;
}

export class Script implements IScript {
  constructor(input: string) {
    this.input = input;

    this.tokenize();
  }

  input: string = "";
  actions: IAction[] = [];
  characters: ICharacter[] = [];
  details: IDetails = {
    authors: "",
    contact: "",
    copyright: "",
    credit: "",
    date: "",
    draftDate: "",
    id: "",
    notes: "",
    source: "",
    title: "",
  };
  dialogueBlocks: IDialogueBlock[] = [];
  scenes: IScene[] = [];
  tokens: IToken[] = [];

  getCharacters() {
    return this.characters;
  }

  getDetails() {
    return this.details;
  }

  getDialogueBlocks() {
    return this.dialogueBlocks;
  }

  getScenes() {
    return this.scenes;
  }

  getTokens() {
    return this.tokens;
  }

  lexer(script: string) {
    return script
      .replace(regex.BONEYARD, "\n$1\n")
      .replace(regex.STANDARDIZER, "\n")
      .replace(regex.CLEANER, "")
      .replace(regex.WHITESPACER, "");
  }

  tokenize() {
    const src = this.lexer(this.input).split(regex.SPLITTER).reverse();
    let i = src.length,
      line,
      match,
      parts,
      text,
      meta,
      dual,
      tokenId: string,
      sceneId: string = "";
    let sceneNumber = 0;

    while (i--) {
      tokenId = uuidv4();
      line = src[i];

      // Title Page
      if (regex.TITLE_PAGE.test(line)) {
        this.details.id = tokenId;
        this.tokens.push({ id: tokenId, type: "DETAILS" });

        match = line
          .replace(regex.TITLE_PAGE, "\n$1")
          .split(regex.SPLITTER)
          .reverse();

        for (let x = 0; x < match.length; x++) {
          parts = match[x].replace(regex.CLEANER, "").split(/\:\n*/);

          const partType = parts[0].trim();

          if (partType.match(regex.AUTHOR)) {
            this.details.authors = parts[1].trim();
          } else if (partType.match(regex.CONTACT)) {
            this.details.contact = parts[1].trim();
          } else if (partType.match(regex.COPYRIGHT)) {
            this.details.copyright = parts[1].trim();
          } else if (partType.match(regex.CREDIT)) {
            this.details.credit = parts[1].trim();
          } else if (partType.match(regex.DATE)) {
            this.details.date = parts[1].trim();
          } else if (partType.match(regex.DRAFT_DATE)) {
            this.details.draftDate = parts[1].trim();
          } else if (partType.match(regex.NOTES)) {
            this.details.notes = parts[1].trim();
          } else if (partType.match(regex.SOURCE)) {
            this.details.source = parts[1].trim();
          } else if (partType.match(regex.TITLE)) {
            this.details.title = parts[1].trim();
          }
        }

        continue;
      }

      // Scene Heading
      if ((match = line.match(regex.SCENE_HEADING))) {
        sceneId = tokenId;
        this.tokens.push({ id: tokenId, type: "SCENE_HEADING" });

        text = match[1] || match[2];

        if (text.indexOf("  ") !== text.length - 2) {
          if ((meta = text.match(regex.SCENE_NUMBER))) {
            sceneNumber = parseInt(meta[2]);

            text = text.replace(regex.SCENE_NUMBER, "");
          } else {
            sceneNumber++;
          }

          let scene: IScene = {
            number: sceneNumber,
            id: tokenId,
            heading: text,
          };

          this.scenes.push(scene);
        }

        continue;
      }

      // Centered
      if ((match = line.match(regex.CENTERED))) {
        this.tokens.push({ id: tokenId, type: "CENTERED" });

        continue;
      }

      // Transition
      if ((match = line.match(regex.TRANSITION))) {
        this.tokens.push({ id: tokenId, type: "TRANSITION" });

        continue;
      }

      /**
       * @TODO
       * Handle dual dialogue
       */

      // Dialogue Block - character, parenthetical, dialogue
      if ((match = line.match(regex.DIALOGUE))) {
        if (match[1].indexOf("  ") !== match[1].length - 2) {
          let dialogueBlock: IDialogueBlock;
          let parenthetical: string = "";
          let dialogue: string = "";
          let characterId = uuidv4();
          let characterName = match[1].trim();
          let characterExits = this.characters.find(
            (character) => character.name === characterName
          );

          this.tokens.push({ id: tokenId, type: "DIALOGUE_BLOCK" });

          if (characterExits) characterId = characterExits.id;
          let character: ICharacter = {
            id: characterId,
            name: characterName,
            sceneId: sceneId,
          };
          if (!characterExits) this.characters.push(character);

          parts = match[3].split(/(\(.+\))(?:\n+)/);

          for (let x = 0; x < parts.length; x++) {
            text = parts[x];

            if (text.length > 0) {
              let type = regex.PARENTHETICAL.test(text)
                ? "PARENTHETICAL"
                : "DIALOGUE";

              if (type === "PARENTHETICAL") parenthetical = text;
              else dialogue = text;
            }
          }

          dialogueBlock = {
            characterId,
            dialogue,
            dual: match[2] ? "RIGHT" : dual ? "LEFT" : undefined,
            id: tokenId,
            parenthetical,
            sceneId,
          };
          this.dialogueBlocks.push(dialogueBlock);

          continue;
        }
      }

      // Section
      if ((match = line.match(regex.SECTION))) {
        this.tokens.push({ id: tokenId, type: "SECTION", text: match[2] });

        continue;
      }

      // Synopsis
      if ((match = line.match(regex.SYNOPSIS))) {
        this.tokens.push({ id: tokenId, type: "SYNOPSIS", text: match[1] });

        continue;
      }

      // NOTE
      if ((match = line.match(regex.NOTE))) {
        this.tokens.push({ id: tokenId, type: "NOTE", text: match[1] });

        continue;
      }

      // BONEYARD
      if ((match = line.match(regex.BONEYARD))) {
        this.tokens.push({
          id: tokenId,
          type: match[0][0] === "/" ? "BONEYARD_BEGIN" : "BONEYARD_END",
        });

        continue;
      }

      // PAGE_BREAK
      if (regex.PAGE_BREAK.test(line)) {
        this.tokens.push({ id: tokenId, type: "PAGE_BREAK" });

        continue;
      }

      // LINE_BREAK
      if (regex.LINE_BREAK.test(line)) {
        this.tokens.push({ id: tokenId, type: "LINE_BREAK" });

        continue;
      }

      if (regex.ACTION) {
        this.tokens.push({ id: tokenId, type: "ACTION", text: line });
      }
    }
  }
}

export interface IFountainFile {
  authors: string;
  contact: string;
  copyright: string;
  credit: string;
  date: string;
  draftDate: string;
  notes: string;
  source: string;
  title: string;
  scenes: Array<IScene>;
}

export interface IScene {
  number: number;
  slugline: string;
  blocks: Array<IBlock>;
}

export interface IBlock {
  type: string;
  text?: string;
}

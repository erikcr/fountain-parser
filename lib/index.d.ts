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
  blocks: Array<IBlock>;
  scenes: Array<IScene>;
}

export interface IBlock {
  id: string;
  type: string;
  text?: string;
}

export interface IScene {
  number: number;
  blockIds: Array<string>;
}

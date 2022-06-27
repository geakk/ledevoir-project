export interface DataJsonObject {
  schema: Object;
  data: DataEntry[];
}

export interface CovidJsonObject {
  schema: Object;
  data: Covid[];
}

export interface DataEntry {
  index: number;
  date: Date;
  time: string;
  title: string;
  source: Source;
  categories: Category[];
}

export interface Source {
  uri: string;
  dataType: string;
  title: string;
}

export interface CategoryFrequencyPerDay {
  date: Date;
  Arts_and_Entertainment: number;
  Business: number;
  Environment: number;
  Health: number;
  Politics: number;
  Science: number;
  Sports: number;
  Technology: number;
  Inconnu: number;
}

export interface Category {
  uri: string;
  label: string;
  wgt: number;
}

export interface Covid {
  'Date de déclaration du cas': Date;
  'Cas confirmés': number;
}

export interface ArticlesByDay {
  date: Date;
  articles: number;
}

export interface WordData {
  word: string;
  frequency: number;
}

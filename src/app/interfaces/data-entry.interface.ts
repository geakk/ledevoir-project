export interface DataJsonObject{
  schema: Object,
  data: DataEntry[]
}
export interface DataEntry {
  index: number,
  date: Date,
  time: string,
  title: string,
  source: Source,
  categories: Category,
}

export interface Source{
  uri: string,
  dataType: string,
  title: string
}

export interface Category{
  uri: string,
  label: string,
  wgt: number
}


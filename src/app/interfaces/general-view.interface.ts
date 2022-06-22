export interface Legend {
  name: string;
  color: string;
  count?: number;
  percentage?: number;
}

export interface MinMax {
  min: number;
  max: number;
}

export interface ViewStudentData {
  name: string;
  overallMark: number;
  overallSentiment: number;
  color: string;
  permanentCode: string;
}

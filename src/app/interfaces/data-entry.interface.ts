export interface CsvDataEntry {
  level: string;
  class: string;
  course: string;
  commentId: string;
  comment: string;
  stake: string;
  permanentCode: string;
  studentName: string;
  overallAverage: number;
  mark: number;
  sentiment: string;
  overallMarkAverage: number;
  overallLevelAverage: number;
}

export interface RawDataEntry extends CsvDataEntry {
  overallStudentPosSentPercAvg: number;
  overallCoursePosSentPercAvg: number;
  overallLevelPosSentPercAvg: number;
  overallStakePosSentPercAvg: number;
}

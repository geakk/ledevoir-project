import { CsvDataEntry, RawDataEntry } from '../interfaces/data-entry.interface';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  schoolName = 'Collège de Montréal';
  rawData: RawDataEntry[] = [];

  constructor(
    // eslint-disable-next-line no-unused-vars
    private readonly http: HttpClient
  ) {}

  async loadData(): Promise<void> {
    const data = await this.http
      .get('assets/data.csv', { responseType: 'text' })
      .toPromise();
    const lines: string[] = data.split('\n');
    // Remove the header
    lines.shift();
    // We assume column will always be in this order :
    // niveau,foyer,matiere,id_commentaire,commentaire,
    // enjeu,code_permanent,nom_etudiant,moyenne_generale,
    // note,sentiment,note_moy_matiere,moyenne_generale_niveau
    let dataParsed: CsvDataEntry[] = [];
    for (const line of lines) {
      const lineTrimmed = line.trim();
      if (lineTrimmed === '') {
        continue;
      }
      const tokens = lineTrimmed.split(',');
      dataParsed.push({
        level: tokens[0],
        class: tokens[1],
        course: tokens[2],
        commentId: tokens[3],
        comment: tokens[4],
        stake: tokens[5],
        permanentCode: tokens[6],
        studentName: tokens[7],
        overallAverage: this.numberFrom(tokens[8]),
        mark: this.numberFrom(tokens[9]),
        sentiment: tokens[10],
        overallMarkAverage: this.numberFrom(tokens[11]),
        overallLevelAverage: this.numberFrom(tokens[12]),
      });
    }
    const dataParsedExtended = this.computeStakesAvgs(dataParsed);
    this.rawData = dataParsedExtended;
    // console.log(this.rawData);
  }

  computeStakesAvgs(data: CsvDataEntry[]): RawDataEntry[] {
    const studentMap: Map<String, CsvDataEntry[]> = new Map();
    const levelMap: Map<String, CsvDataEntry[]> = new Map();
    const courseMap: Map<String, CsvDataEntry[]> = new Map();
    const stakeMap: Map<String, CsvDataEntry[]> = new Map();

    for (const row of data) {
      this.appendToMap(studentMap, row.permanentCode, row);
      this.appendToMap(levelMap, row.level, row);
      this.appendToMap(courseMap, row.course, row);
      this.appendToMap(stakeMap, row.stake, row);
    }

    const studentPercentageMap: Map<String, number> =
      this.mapPercentage(studentMap);
    const levelPercentageMap: Map<String, number> =
      this.mapPercentage(levelMap);
    const coursePercentageMap: Map<String, number> =
      this.mapPercentage(courseMap);
    const stakePercentageMap: Map<String, number> =
      this.mapPercentage(stakeMap);

    const extendData: RawDataEntry[] = data.map((row) => ({
      ...row,
      overallStudentPosSentPercAvg: studentPercentageMap.get(
        row.permanentCode
      )!,
      overallCoursePosSentPercAvg: coursePercentageMap.get(row.course)!,
      overallLevelPosSentPercAvg: levelPercentageMap.get(row.level)!,
      overallStakePosSentPercAvg: stakePercentageMap.get(row.stake)!,
    }));
    // console.log(extendData);
    return extendData;
  }

  private appendToMap<Key, Value>(
    map: Map<Key, Value[]>,
    key: Key,
    value: Value
  ) {
    if (map.has(key)) {
      (map.get(key) as Value[]).push(value);
    } else {
      map.set(key, [value]);
    }
  }

  private mapPercentage<Key>(
    oldMap: Map<Key, CsvDataEntry[]>
  ): Map<Key, number> {
    const newMap = new Map<Key, number>();
    oldMap.forEach((rows: CsvDataEntry[], key) => {
      const percentage =
        (rows.filter((r) => r.sentiment === 'Positif').length / rows.length) *
        100;
      newMap.set(key, percentage);
    });
    return newMap;
  }

  private numberFrom(s: string): number {
    return s.trim() ? +s : NaN;
  }
}

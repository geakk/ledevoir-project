import { CsvDataEntry } from '../interfaces/data-entry.interface';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  schoolName = 'Le Devoir';
  constructor(
    // eslint-disable-next-line no-unused-vars
    private readonly http: HttpClient
  ) {}

  async loadData(): Promise<void> {
    console.log("HERE")
    const data = await this.http
      .get('assets/articles_covid.csv', { responseType: 'text' })
      .toPromise();
      console.log("HERE2")
    const lines: string[] = data.split('\n');
    // Remove the header
    lines.shift();
    let dataParsed: CsvDataEntry[] = [];
    for (const line of lines) {
      const lineTrimmed = line.trim();
      if (lineTrimmed === '') {
        continue;
      }
      const tokens = lineTrimmed.split(',');
      console.log(tokens)
      dataParsed.push({
        count: this.numberFrom(tokens[0]),
        count2: this.numberFrom(tokens[1]),
        uri: tokens[2],
        lang: tokens[3],
        isDuplicate: tokens[4],
        date: tokens[5],
        time: tokens[6],
        dateTime: tokens[7],
        dateTimePub: tokens[8],
        dataType: tokens[9],
        sim: tokens[10],
        url: tokens[11],
        title: tokens[12],
        body: tokens[13],
        source: this.objectFrom(tokens[14]),
        authors: this.objectFrom(tokens[15]),
        concepts: this.objectFrom(tokens[16]),
        categories: this.objectFrom(tokens[17]),
        image: tokens[18],
        eventUri: tokens[19],
        location: tokens[20],
        sentiment: tokens[21],
        wgt: this.numberFrom(tokens[22]),
        relevance: this.numberFrom(tokens[23]),
        unnamed: tokens[24],
      });
    }
    console.log(dataParsed);
  }

  

  private numberFrom(s: string): number {
    return s.trim() ? +s : NaN;
  }

  private objectFrom(s: string): object{
    return JSON.parse(s);
  }

}

import { Covid, CovidJsonObject, DataEntry, DataJsonObject} from '../interfaces/data-entry.interface';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  constructor(
    // eslint-disable-next-line no-unused-vars
    private readonly http: HttpClient
  ) {}

  async loadData(): Promise<DataEntry[]> {
    const data = (await this.http
      .get('assets/articles_covid.json')
      .toPromise()) as DataJsonObject;
    return this.parseData(data.data);
  }

  async loadCovidData(): Promise<Covid[]> {
    const data = (await this.http
      .get('assets/cas_covid.json')
      .toPromise()) as CovidJsonObject;
      console.log(this.parseCovidData(data.data))
    return this.parseCovidData(data.data);
  }

  
  private parseData(data: any){
    for(let obj of data){
      let source  = (0, eval)('(' + obj.source + ')');
      let categories = (0, eval)('(' + obj.categories + ')');
      let date = new Date(obj.date);
      obj.source = source;
      obj.categories = categories;
      obj.date = date;
    }
    return data;
  }

  private parseCovidData(data: any){
    for(let obj of data){
      let date = new Date(obj["Date de déclaration du cas"]);
      obj["Date de déclaration du cas"] = date;
    }
    return data;
  }
}

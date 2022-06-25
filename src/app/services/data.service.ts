/* eslint-disable prettier/prettier */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  Covid,
  CovidJsonObject,
  DataEntry,
  DataJsonObject,
} from '../interfaces/data-entry.interface';

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
    return this.parseCovidData(data.data);
  }

  private parseData(data: any) {
    for (let obj of data) {
      let source = (0, eval)('(' + obj.source + ')');
      let categories = (0, eval)('(' + obj.categories + ')');
      let date = new Date(obj.date);
      obj.source = source;
      obj.categories = categories;
      obj.date = date;
    }
    return data;
  }

  private parseCovidData(data: any) {
    for (let obj of data) {
      let date = new Date(obj['Date de déclaration du cas']);
      obj['Date de déclaration du cas'] = date;
    }
    return data;
  }

  public getNbArticlesByDay(data: DataEntry[]) {
    let dateArray = data.map((data) => data.date);
    let dateArrayString = dateArray.map((date) => date.toString());
    const count: any = {};

    for (const element of dateArrayString) {
      if (count[element]) {
        count[element] += 1;
      } else {
        count[element] = 1;
      }
    }
    return count;
  }
  public getCategoryOccurence(data: DataEntry[]) {
    let categoriesCount = {
      'news/Politics': {
        firstWave: 0,
        secondWave: 0,
        thirdWave: 0,
        fourthWave: 0,
        fivethWave: 0,
        sixthWave: 0,
      },
      'news/Business': {
        firstWave: 0,
        secondWave: 0,
        thirdWave: 0,
        fourthWave: 0,
        fivethWave: 0,
        sixthWave: 0,
      },
      'news/Arts_and_Entertainment': {
        firstWave: 0,
        secondWave: 0,
        thirdWave: 0,
        fourthWave: 0,
        fivethWave: 0,
        sixthWave: 0,
      },
      'news/Health': {
        firstWave: 0,
        secondWave: 0,
        thirdWave: 0,
        fourthWave: 0,
        fivethWave: 0,
        sixthWave: 0,
      },
      'news/Technology': {
        firstWave: 0,
        secondWave: 0,
        thirdWave: 0,
        fourthWave: 0,
        fivethWave: 0,
        sixthWave: 0,
      },
      'news/Science': {
        firstWave: 0,
        secondWave: 0,
        thirdWave: 0,
        fourthWave: 0,
        fivethWave: 0,
        sixthWave: 0,
      },
      'news/Sports': {
        firstWave: 0,
        secondWave: 0,
        thirdWave: 0,
        fourthWave: 0,
        fivethWave: 0,
        sixthWave: 0,
      },
      'news/Environment': {
        firstWave: 0,
        secondWave: 0,
        thirdWave: 0,
        fourthWave: 0,
        fivethWave: 0,
        sixthWave: 0,
      },
    };

    const firstWaveStartDate = new Date('2020-02-23');
    const firstWaveEndDate = new Date('2020-07-11');

    const secondWaveStartDate = new Date('2020-08-23');
    const secondWaveEndDate = new Date('2021-03-20');

    const thirdWaveStartDate = new Date('2021-03-21');
    const thirdWaveEndDate = new Date('2021-07-17');

    const fourthWaveStartDate = new Date('2021-07-18');
    const fourthWaveEndDate = new Date('2021-12-04');

    const fivethWaveStartDate = new Date('2021-12-05');
    const fivethWaveEndDate = new Date('2022-03-12');

    const sixthWaveStartDate = new Date('2020-03-13');
    // const sixthWaveEndDate = new Date('2020-07-11');

    for (let i = 0; i < data.length; i++) {
      try {
        if (
          data[i].date >= firstWaveStartDate &&
          data[i].date <= firstWaveEndDate
        ) {
          let currentCategory = data[i].categories[0].uri;
          switch (currentCategory) {
            case 'news/Politics':
              categoriesCount['news/Politics'].firstWave++;
              break;
            case 'news/Business':
              categoriesCount['news/Business'].firstWave++;
              break;
            case 'news/Arts_and_Entertainment':
              categoriesCount['news/Arts_and_Entertainment'].firstWave++;
              break;
            case 'news/Health':
              categoriesCount['news/Health'].firstWave++;
              break;
            case 'news/Technology':
              categoriesCount['news/Technology'].firstWave++;
              break;
            case 'news/Science':
              categoriesCount['news/Science'].firstWave++;
              break;
            case 'news/Sports':
              categoriesCount['news/Sports'].firstWave++;
              break;
            case 'news/Environment':
              categoriesCount['news/Environment'].firstWave++;
              break;
            default:
              break;
          }
        }
      } catch (error) {
        // console.log('ERROR')
      }
    }

    for (let i = 0; i < data.length; i++) {
      try {
        if (
          data[i].date >= secondWaveStartDate &&
          data[i].date <= secondWaveEndDate
        ) {
          let currentCategory = data[i].categories[0].uri;
          switch (currentCategory) {
            case 'news/Politics':
              categoriesCount['news/Politics'].secondWave++;
              break;
            case 'news/Business':
              categoriesCount['news/Business'].secondWave++;
              break;
            case 'news/Arts_and_Entertainment':
              categoriesCount['news/Arts_and_Entertainment'].secondWave++;
              break;
            case 'news/Health':
              categoriesCount['news/Health'].secondWave++;
              break;
            case 'news/Technology':
              categoriesCount['news/Technology'].secondWave++;
              break;
            case 'news/Science':
              categoriesCount['news/Science'].secondWave++;
              break;
            case 'news/Sports':
              categoriesCount['news/Sports'].secondWave++;
              break;
            case 'news/Environment':
              categoriesCount['news/Environment'].secondWave++;
              break;
            default:
              break;
          }
        }
      } catch (error) {
        // console.log('ERROR')
      }
    }

    for (let i = 0; i < data.length; i++) {
      try {
        if (
          data[i].date >= thirdWaveStartDate &&
          data[i].date <= thirdWaveEndDate
        ) {
          let currentCategory = data[i].categories[0].uri;
          switch (currentCategory) {
            case 'news/Politics':
              categoriesCount['news/Politics'].thirdWave++;
              break;
            case 'news/Business':
              categoriesCount['news/Business'].thirdWave++;
              break;
            case 'news/Arts_and_Entertainment':
              categoriesCount['news/Arts_and_Entertainment'].thirdWave++;
              break;
            case 'news/Health':
              categoriesCount['news/Health'].thirdWave++;
              break;
            case 'news/Technology':
              categoriesCount['news/Technology'].thirdWave++;
              break;
            case 'news/Science':
              categoriesCount['news/Science'].thirdWave++;
              break;
            case 'news/Sports':
              categoriesCount['news/Sports'].thirdWave++;
              break;
            case 'news/Environment':
              categoriesCount['news/Environment'].thirdWave++;
              break;
            default:
              break;
          }
        }
      } catch (error) {
        // console.log('ERROR')
      }
    }

    for (let i = 0; i < data.length; i++) {
      try {
        if (
          data[i].date >= fourthWaveStartDate &&
          data[i].date <= fourthWaveEndDate
        ) {
          let currentCategory = data[i].categories[0].uri;
          switch (currentCategory) {
            case 'news/Politics':
              categoriesCount['news/Politics'].fourthWave++;
              break;
            case 'news/Business':
              categoriesCount['news/Business'].fourthWave++;
              break;
            case 'news/Arts_and_Entertainment':
              categoriesCount['news/Arts_and_Entertainment'].fourthWave++;
              break;
            case 'news/Health':
              categoriesCount['news/Health'].fourthWave++;
              break;
            case 'news/Technology':
              categoriesCount['news/Technology'].fourthWave++;
              break;
            case 'news/Science':
              categoriesCount['news/Science'].fourthWave++;
              break;
            case 'news/Sports':
              categoriesCount['news/Sports'].fourthWave++;
              break;
            case 'news/Environment':
              categoriesCount['news/Environment'].fourthWave++;
              break;
            default:
              break;
          }
        }
      } catch (error) {
        // console.log('ERROR')
      }
    }

    for (let i = 0; i < data.length; i++) {
      try {
        if (
          data[i].date >= fivethWaveStartDate &&
          data[i].date <= fivethWaveEndDate
        ) {
          let currentCategory = data[i].categories[0].uri;
          switch (currentCategory) {
            case 'news/Politics':
              categoriesCount['news/Politics'].fivethWave++;
              break;
            case 'news/Business':
              categoriesCount['news/Business'].fivethWave++;
              break;
            case 'news/Arts_and_Entertainment':
              categoriesCount['news/Arts_and_Entertainment'].fivethWave++;
              break;
            case 'news/Health':
              categoriesCount['news/Health'].fivethWave++;
              break;
            case 'news/Technology':
              categoriesCount['news/Technology'].fivethWave++;
              break;
            case 'news/Science':
              categoriesCount['news/Science'].fivethWave++;
              break;
            case 'news/Sports':
              categoriesCount['news/Sports'].fivethWave++;
              break;
            case 'news/Environment':
              categoriesCount['news/Environment'].fivethWave++;
              break;
            default:
              break;
          }
        }
      } catch (error) {
        // console.log('ERROR')
      }
    }

    for (let i = 0; i < data.length; i++) {
      try {
        if (data[i].date >= sixthWaveStartDate) {
          let currentCategory = data[i].categories[0].uri;
          switch (currentCategory) {
            case 'news/Politics':
              categoriesCount['news/Politics'].sixthWave++;
              break;
            case 'news/Business':
              categoriesCount['news/Business'].sixthWave++;
              break;
            case 'news/Arts_and_Entertainment':
              categoriesCount['news/Arts_and_Entertainment'].sixthWave++;
              break;
            case 'news/Health':
              categoriesCount['news/Health'].sixthWave++;
              break;
            case 'news/Technology':
              categoriesCount['news/Technology'].sixthWave++;
              break;
            case 'news/Science':
              categoriesCount['news/Science'].sixthWave++;
              break;
            case 'news/Sports':
              categoriesCount['news/Sports'].sixthWave++;
              break;
            case 'news/Environment':
              categoriesCount['news/Environment'].sixthWave++;
              break;
            default:
              break;
          }
        }
      } catch (error) {
        // console.log('ERROR')
      }
    }
    return categoriesCount;
  }

  getArticleByDay(data: DataEntry[]) {
    return data.map((data) => ({
      date: data.date,
      categorie: this.getCategorie(data.categories),
    }));
  }

  getCategorie(categorie: any): String {
    if (categorie === null || categorie.length == 0) return 'Inconnu';
    else {
      return categorie[0].uri;
    }
  }
}

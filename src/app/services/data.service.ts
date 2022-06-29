/* eslint-disable prettier/prettier */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as d3 from 'd3';
import { firstWaveEndDate, firstWaveStartDate, fivethWaveEndDate, fivethWaveStartDate, fourthWaveEndDate, fourthWaveStartDate, secondWaveEndDate, secondWaveStartDate, sixthWaveEndDate, sixthWaveStartDate, thirdWaveEndDate, thirdWaveStartDate } from '../constants/themes';

import {
  CategoryFrequencyPerDay,
  Covid,
  DataEntry,
} from '../interfaces/data-entry.interface';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  constructor(
  ) {}

  async loadData(): Promise<DataEntry[]> {
    const data = await  d3.json
      ('/assets/articles_covid.json');
    return this.parseData((data as any).data);
  }

  async loadCovidData(): Promise<Covid[]> {
    const data = (await d3.json('/assets/cas_covid.json'));
    return this.parseCovidData((data as any).data);
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
      },
      'news/Business': {
        firstWave: 0,
        secondWave: 0,
        thirdWave: 0,
        fourthWave: 0,
        fivethWave: 0,
      },
      'news/Arts_and_Entertainment': {
        firstWave: 0,
        secondWave: 0,
        thirdWave: 0,
        fourthWave: 0,
        fivethWave: 0,
      },
      'news/Health': {
        firstWave: 0,
        secondWave: 0,
        thirdWave: 0,
        fourthWave: 0,
        fivethWave: 0,
      },
      'news/Technology': {
        firstWave: 0,
        secondWave: 0,
        thirdWave: 0,
        fourthWave: 0,
        fivethWave: 0,
      },
      'news/Science': {
        firstWave: 0,
        secondWave: 0,
        thirdWave: 0,
        fourthWave: 0,
        fivethWave: 0,
      },
      'news/Sports': {
        firstWave: 0,
        secondWave: 0,
        thirdWave: 0,
        fourthWave: 0,
        fivethWave: 0,
      },
      'news/Environment': {
        firstWave: 0,
        secondWave: 0,
        thirdWave: 0,
        fourthWave: 0,
        fivethWave: 0,
      },
    };



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
    return categoriesCount;
  }

  getArticleByDay(data: DataEntry[]) {
    
    const dataArray = data.map((data) => ({
      date: data.date,
      categorie: this.getCategorie(data.categories),
    }));
    const objectArray: CategoryFrequencyPerDay[] = [];
    for (const value of dataArray) {
      const newArray = objectArray.find(
        (e) => e.date.getTime() === value.date.getTime()
      );

      if (newArray) {
        switch (value.categorie) {
          case 'news/Arts_and_Entertainment':
            newArray.Arts_and_Entertainment++;
            break;
          case 'news/Business':
            newArray.Business++;
            break;
          case 'news/Environment':
            newArray.Environment++;
            break;
          case 'news/Health':
            newArray.Health++;
            break;
          case 'news/Politics':
            newArray.Politics++;
            break;
          case 'news/Science':
            newArray.Science++;
            break;
          case 'news/Sports':
            newArray.Sports++;
            break;
          case 'news/Technology':
            newArray.Technology++;
            break;
          case 'Inconnu':
            newArray.Inconnu++;
        }
      } else {
        objectArray.push({
          date: value.date,
          Arts_and_Entertainment: 0,
          Business: 0,
          Environment: 0,
          Health: 0,
          Politics: 0,
          Science: 0,
          Sports: 0,
          Technology: 0,
          Inconnu: 0,
        });
      }
    }
    return objectArray;
  }

  getCategorie(categorie: any): String {
    if (categorie === null || categorie.length == 0) return 'Inconnu';
    else {
      return categorie[0].uri;
    }
  }

  getDataByWave(wave: string, articleDataByDay: CategoryFrequencyPerDay[]): CategoryFrequencyPerDay[] {
    let data: CategoryFrequencyPerDay[] = [];
    switch (wave) {
      case 'first':
        data = articleDataByDay.filter((d) => {
          return (
            d.date.getTime() <= firstWaveEndDate.getTime() &&
            d.date.getTime() >= firstWaveStartDate.getTime()
          );
        });
        break;
      case 'second':
        data = articleDataByDay.filter((d) => {
          return (
            d.date.getTime() <= secondWaveEndDate.getTime() &&
            d.date.getTime() >= secondWaveStartDate.getTime()
          );
        });
        break;
      case 'third':
        data = articleDataByDay.filter((d) => {
          return (
            d.date.getTime() <= thirdWaveEndDate.getTime() &&
            d.date.getTime() >= thirdWaveStartDate.getTime()
          );
        });
        break;
      case 'fourth':
        data = articleDataByDay.filter((d) => {
          return (
            d.date.getTime() <= fourthWaveEndDate.getTime() &&
            d.date.getTime() >= fourthWaveStartDate.getTime()
          );
        });
        break;
      case 'fifth':
        data = articleDataByDay.filter((d) => {
          return (
            d.date.getTime() <= fivethWaveEndDate.getTime() &&
            d.date.getTime() >= fivethWaveStartDate.getTime()
          );
        });
        break;
      case 'six':
        data = articleDataByDay.filter((d) => {
          return (
            d.date.getTime() <= sixthWaveEndDate.getTime() &&
            d.date.getTime() >= sixthWaveStartDate.getTime()
          );
        });
        break;
    }
    return data;
  }
}

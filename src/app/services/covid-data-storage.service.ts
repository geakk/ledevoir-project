import { Injectable } from '@angular/core';
import { Covid } from '../interfaces/data-entry.interface';

@Injectable({
  providedIn: 'root'
})
export class CovidDataStorageService {

  static covidDataStorageKey = 'covidDataKey'

  storeData(covidData: Covid[]) {
    try {
      window.localStorage[CovidDataStorageService.covidDataStorageKey] = JSON.stringify(covidData);

    } catch {
      console.error('Unable to set theme in local storage');
    }
  }

  getCovidStoredData(): string | null {
    try {
      return window.localStorage[CovidDataStorageService.covidDataStorageKey] || null;
    } catch {
      return null;
    }
  }

  clearStorage() {
    try {
      window.localStorage.removeItem(CovidDataStorageService.covidDataStorageKey);

    } catch {
      console.error('Unable to remove theme from local storage');
    }
  }
}

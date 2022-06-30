/* eslint-disable no-unused-vars */
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { Covid, DataEntry } from 'src/app/interfaces/data-entry.interface';

import { CovidDataStorageService } from 'src/app/services/covid-data-storage.service';
import { DataService } from 'src/app/services/data.service';
import { MatDrawer } from '@angular/material/sidenav';
import { ThemeService } from 'src/app/services/theme.service';

interface Option {
  label: string;
  selected: boolean;
}

interface FilterableAttribute {
  name: string;
  key: string;
  options: Option[];
  allSelected: boolean;
  someSelected: boolean;
  filter: string;
  filteredOptions: Option[];
  useAutocomplete: boolean;
  expanded: boolean;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss', './theme-picker.scss'],
})
export class AppComponent implements OnInit {
  @ViewChild('drawer') drawer: MatDrawer | undefined;

  isLoading = true;
  schoolName: string = '';
  articlesData: DataEntry[] = [];
  covidData: Covid[] = [];
  separatorKeysCodes: number[] = [ENTER, COMMA];

  filterableAttributes: FilterableAttribute[] = [];
  constructor(
    private readonly dataService: DataService,
    private readonly covidStorageService: CovidDataStorageService,
    public readonly themeService: ThemeService,
    public readonly cdr: ChangeDetectorRef
  ) {}

  async ngOnInit(): Promise<void> {
    this.dataService.loadData().then((data) => {
      this.articlesData = data;
      this.isLoading = false;
    });
    const covid = this.covidStorageService.getCovidStoredData();
    if (!covid) {
      this.covidData = await this.dataService.loadCovidData();
      this.covidStorageService.storeData(this.covidData);
    } else {
      this.covidData = JSON.parse(covid);
    }
  }
}

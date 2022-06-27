/* eslint-disable prettier/prettier */
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { MatDrawer } from '@angular/material/sidenav';
import { DomSanitizer } from '@angular/platform-browser';
import { Covid, DataEntry } from 'src/app/interfaces/data-entry.interface';
import { DataService } from 'src/app/services/data.service';
import { FilterEventsService } from 'src/app/services/filter-events.service';
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
  articlesData: DataEntry[] = []
  covidData: Covid[] = []
  separatorKeysCodes: number[] = [ENTER, COMMA];

  

  filterableAttributes: FilterableAttribute[] = [];
  constructor(
    // eslint-disable-next-line no-unused-vars
    private readonly dataService: DataService,
    // eslint-disable-next-line no-unused-vars
    private readonly matIconRegistry: MatIconRegistry,
    // eslint-disable-next-line no-unused-vars
    private readonly sanitizer: DomSanitizer,
    // eslint-disable-next-line no-unused-vars
    public readonly themeService: ThemeService,
    // eslint-disable-next-line no-unused-vars
    private readonly filterEventService: FilterEventsService,
    // eslint-disable-next-line no-unused-vars
    public readonly cdr: ChangeDetectorRef
  ) {
  }


  async ngOnInit(): Promise<void> {
    this.dataService.loadData().then((data)=>{
this.articlesData = data;
this.isLoading = false;

    });
    const covid = this.dataService.getCovidStoredData();
    if(!covid){
      this.covidData = await this.dataService.loadCovidData();
      this.dataService.storeData(this.covidData);

    }
    else{
      this.covidData = JSON.parse(covid);
    }

  }
}

import {
  AfterViewChecked,
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';

import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { Covid, DataEntry } from 'src/app/interfaces/data-entry.interface';
import { DataService } from 'src/app/services/data.service';

import { FilterEventsService } from 'src/app/services/filter-events.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit
{
  @Input() articlesData: DataEntry[] = [];
  @Input() covidData: Covid[] = [];

  ngOnInit(): void{
  }
}

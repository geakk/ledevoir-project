import { Component, Input, OnInit } from '@angular/core';

import { Covid, DataEntry } from 'src/app/interfaces/data-entry.interface';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  @Input() articlesData: DataEntry[] = [];
  @Input() covidData: Covid[] = [];

  ngOnInit(): void {}
}

import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { FilterEventsService } from 'src/app/services/filter-events.service';

import { ThemeService } from 'src/app/services/theme.service';

import * as d3 from 'd3';

interface bars {
  model_name: string;
  field1: number;
  field2: number;
}

interface Margin {
  left: number;
  right: number;
  bottom: number;
  top: number;
}

@Component({
  selector: 'app-level-comparison-view',
  templateUrl: './level-comparison-view.component.html',
  styleUrls: ['./level-comparison-view.component.scss'],
})
export class LevelComparisonViewComponent  {}

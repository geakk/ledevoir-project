import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { FilterEventsService } from '../services/filter-events.service';
import { ThemeService } from '../services/theme.service';

import * as d3 from 'd3';

// eslint-disable-next-line no-unused-vars
enum Sentiment {
  // eslint-disable-next-line no-unused-vars
  positive = 'Positif',
  // eslint-disable-next-line no-unused-vars
  negative = 'Négatif',
}

interface SentimentResults {
  positivePercentage: number;
  positiveCount: number;
  negativePercentage: number;
  negativeCount: number;
}

@Component({
  selector: 'app-comments-summary-view',
  templateUrl: './comments-summary-view.component.html',
  styleUrls: ['./comments-summary-view.component.scss'],
})
export class CommentsSummaryViewComponent {
  
}

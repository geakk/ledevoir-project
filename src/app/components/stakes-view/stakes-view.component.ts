import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild,
} from '@angular/core';


import * as d3 from 'd3';

interface Margin {
  left: number;
  right: number;
  bottom: number;
  top: number;
}

// eslint-disable-next-line no-unused-vars
enum Sentiment {
  // eslint-disable-next-line no-unused-vars
  positive = 'Positif',
  // eslint-disable-next-line no-unused-vars
  negative = 'Négatif',
}

@Component({
  selector: 'app-stakes-view',
  templateUrl: './stakes-view.component.html',
  styleUrls: ['./stakes-view.component.scss'],
})
export class StakesViewComponent {

}

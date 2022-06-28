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
import {
  MinMax,
  ViewStudentData,
} from 'src/app/interfaces/general-view.interface';

// This visualisation is based on : https://codepen.io/borntofrappe/pen/QXNvjx

@Component({
  selector: 'app-general-view',
  templateUrl: './general-view.component.html',
  styleUrls: ['./general-view.component.scss'],
})
export class GeneralViewComponent {
 
}

import { AfterViewInit, Component, ElementRef, Input } from '@angular/core';
import * as d3 from 'd3';
import { AxisScale } from 'd3';
import { Covid, DataEntry } from '../../interfaces/data-entry.interface';
import { DataService } from '../../services/data.service';
import { FilterEventsService } from '../../services/filter-events.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-stacked-area-chart',
  templateUrl: './stacked-area-chart.component.html',
  styleUrls: ['./stacked-area-chart.component.scss'],
})
export class StackedAreaChartComponent implements AfterViewInit {
  @Input() articlesData: DataEntry[] = [];
  @Input() covidData: Covid[] = [];
  public data: any;

  private width = 800;
  private height = 700;
  private margin = 50;

  public xScale: d3.AxisScale<Date> | undefined;

  constructor(
    // eslint-disable-next-line no-unused-vars
    public chartElem: ElementRef,
    private readonly host: ElementRef,
    // eslint-disable-next-line no-unused-vars
    private readonly theme: ThemeService,
    // eslint-disable-next-line no-unused-vars
    private readonly filter: FilterEventsService,
    private dataService: DataService
  ) {}

  ngAfterViewInit(): void {
    this.data = this.dataService.getCategoryOccurence(this.articlesData);
    this.createChart();
  }

  createChart() {
    let casCovid = this.covidData.map((d) => d['Cas confirmés']);
    const nbArticlePerDay = this.dataService.getNbArticlesByDay(
      this.articlesData
    );
    let dates = Object.keys(nbArticlePerDay).map((d) => new Date(d));
    let articles: number[] = Object.values(nbArticlePerDay);

    const svg = d3
      .select(this.chartElem.nativeElement)
      .select('.stacked-area-chart')
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height)
      .append('g')
      .style(
        'transform',
        'translate(' + this.margin + 'px, ' + this.margin + 'px)'
      )
      .call(d3.axisBottom(this.getXScale(dates)));
    let stack = d3
      .stack()
      .keys([
        'Arts_and_Entertainment',
        'Business',
        'Environment',
        'Health',
        'Politics',
        'Science',
        'Sports',
        'Technology',
      ]);
    const colors = [
      '#75d481',
      '#ff4848',
      '#ffac2e',
      '#7dbbf8',
      '#FDF4E3',
      '#4D5645',
      '#755C48',
      '#6C6874',
    ];
    const d = this.dataService.getArticleByDay(this.articlesData);
    let stackedData = stack(d as Iterable<{ [key: string]: number }>);
    console.log(stackedData);
    const stackMaxLength = stackedData[stackedData.length - 1];
    const yScale = this.getYScale();
    yScale.domain([
      0,
      d3.max(stackMaxLength, function (d: any) {
        return d[1];
      }),
    ]);
    svg.append('g').call(d3.axisLeft(yScale));
  }

  getXScale(date: Date[]): AxisScale<Date> {
    return d3
      .scaleTime()
      .domain([this.getMinDate(date), this.getMaxDate(date)])
      .range([this.margin, this.width - 2 * this.margin]);
  }

  getYScale() {
    return d3.scaleLinear().range([0, this.height - 2 * this.margin]);
  }

  getMinDate(dates: Date[]) {
    return dates.reduce(function (a, b) {
      return a < b ? a : b;
    });
  }

  getMaxDate(dates: Date[]) {
    return dates.reduce(function (a, b) {
      return a > b ? a : b;
    });
  }
}

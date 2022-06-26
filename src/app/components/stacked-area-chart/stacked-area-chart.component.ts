import { AfterViewInit, Component, ElementRef, Input } from '@angular/core';
import * as d3 from 'd3';
import { AxisScale } from 'd3';
import {
  CategoryFrequencyPerDay,
  Covid,
  DataEntry,
} from '../../interfaces/data-entry.interface';
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

  private width = 600;
  private height = 500;
  private margin = 60;

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
    this.data = this.dataService.getArticleByDay(this.articlesData);
    this.createChart();
  }

  createChart() {
    let casCovid = this.covidData.map((d) => d['Cas confirmés']);
    const nbArticlePerDay = this.dataService.getNbArticlesByDay(
      this.articlesData
    );
    // let dates = Object.keys(nbArticlePerDay).map((d) => new Date(d));
    // let articles: number[] = Object.values(nbArticlePerDay);
    const xScale = this.getXScale(this.data);
    const yScale = this.getYScale();

    const svg = d3
      .select(this.chartElem.nativeElement)
      .select('.stacked-area-chart')
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height)
      .append('g')
      .style(
        'transform',
        'translate(' + this.margin / 2 + ',' + this.margin / 2 + ')'
      );
    svg
      .append('g')
      .attr('transform', 'translate(0,' + (this.height - this.margin) + ')')
      .call(d3.axisBottom(xScale));

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
    let stackedData = stack(this.data);

    yScale.domain([
      0,
      d3.max(stackedData[stackedData.length - 1], function (d: any) {
        return d[1];
      }),
    ]);
    svg.append('g').call(d3.axisRight(yScale));

    let area = d3
      .area()
      .x((d: any) => xScale(d.date))
      .y0((d: any) => yScale(d.date(d[0])))
      .y1((d: any) => yScale(d.date(d[1])));

    let series = svg
      .selectAll('g.series')
      .data(stackedData)
      .enter()
      .append('g')
      .attr('class', 'series');

    series
      .append('path')
      .style('fill', function (d, i) {
        return colors[i];
      })
      .attr('d', function (d: any) {
        return area(d);
      });
  }

  getXScale(data: CategoryFrequencyPerDay[]): AxisScale<Date> {
    return d3
      .scaleTime()
      .domain([
        d3.min(data, function (d: any) {
          return d.date;
        }),
        d3.max(data, function (d: any) {
          return d.date;
        }),
      ])
      .range([this.margin, this.width - 2 * this.margin]);
  }

  getYScale() {
    return d3.scaleLinear().range([this.margin, this.height - 2 * this.margin]);
  }
}

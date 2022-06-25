import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
} from '@angular/core';
import * as d3 from 'd3';
import { Covid, DataEntry } from 'src/app/interfaces/data-entry.interface';
import { DataService } from 'src/app/services/data.service';
import { FilterEventsService } from 'src/app/services/filter-events.service';
import { ThemeService } from 'src/app/services/theme.service';

// This visualisation is based on : https://codepen.io/borntofrappe/pen/QXNvjx

@Component({
  selector: 'app-line-chart',
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.scss'],
})
export class LineChartComponent implements OnChanges, AfterViewInit {
  @Input() articlesData: DataEntry[] = [];
  @Input() covidData: Covid[] = [];
  public lineGroup:
    | d3.Selection<SVGPathElement, unknown, null, undefined>
    | undefined;
  public lineGroupCovid:
    | d3.Selection<SVGPathElement, unknown, null, undefined>
    | undefined;
  private width = 800;
  private height = 700;
  private margin = 50;

  public svg: d3.Selection<SVGSVGElement, unknown, null, undefined> | undefined;
  public svgInner:
    | d3.Selection<SVGGElement, unknown, null, undefined>
    | undefined;
  public yScale: d3.AxisScale<number> | undefined;
  public xScale: d3.AxisScale<Date> | undefined;
  public xAxis: d3.Selection<SVGGElement, unknown, null, undefined> | undefined;
  public yAxis: d3.Selection<SVGGElement, unknown, null, undefined> | undefined;
  articlesDataByDate = {};
  public data: any;
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
    this.data = this.dataService.getNbArticlesByDay(this.articlesData);
    this.initializeChart();
    this.drawChart();
  }

  public ngOnChanges(changes: { hasOwnProperty: (arg0: string) => any }): void {
    if (changes.hasOwnProperty('data') && this.data) {
      console.log(this.data);
      this.initializeChart();
      this.drawChart();

      window.addEventListener('resize', () => this.drawChart());
    }
  }

  private initializeChart(): void {
    let casCovid = this.covidData.map((d) => d['Cas confirmés']);
    let dates = Object.keys(this.data).map((d) => new Date(d));
    let articles: number[] = Object.values(this.data);
    let minDate = dates.reduce(function (a, b) {
      return a < b ? a : b;
    });
    let maxDate = dates.reduce(function (a, b) {
      return a > b ? a : b;
    });
    this.svg = d3
      .select(this.chartElem.nativeElement)
      .select('.linechart')
      .append('svg')
      .attr('height', this.height);

    this.svgInner = this.svg
      .append('g')
      .style(
        'transform',
        'translate(' + this.margin + 'px, ' + this.margin + 'px)'
      );

    this.yScale = d3
      .scaleLinear()
      .domain([Math.max(...casCovid) + 1, Math.min(...casCovid) - 1])
      .range([0, this.height - 2 * this.margin]);

    this.yAxis = this.svgInner
      .append('g')
      .attr('id', 'y-axis')
      .style('transform', 'translate(' + this.margin + 'px,  0)');

    this.xScale = d3
      .scaleTime()
      .domain([minDate, maxDate])
      .range([this.margin, this.width - 2 * this.margin]);

    this.xAxis = this.svgInner
      .append('g')
      .attr('id', 'x-axis')
      .style(
        'transform',
        'translate(0, ' + (this.height - 2 * this.margin) + 'px)'
      );

    this.lineGroup = this.svgInner
      .append('g')
      .append('path')
      .attr('id', 'line')
      .style('fill', 'none')
      .style('stroke', 'red')
      .style('stroke-width', '2px');

    this.lineGroupCovid = this.svgInner
      .append('g')
      .append('path')
      .attr('id', 'line')
      .style('fill', 'none')
      .style('stroke', 'blue')
      .style('stroke-width', '2px');
  }

  private drawChart(): void {
    this.width = this.chartElem.nativeElement.getBoundingClientRect().width;
    this.svg!.attr('width', this.width);

    const xAxis = d3
      .axisBottom(this.xScale!)
      .ticks(10)
      .tickFormat(d3.timeFormat('%d / %m / %Y'));

    this.xAxis!.call(xAxis);

    const yAxis = d3.axisLeft(this.yScale!);

    this.yAxis!.call(yAxis);

    const line = d3
      .line()
      .x((d) => d[0])
      .y((d) => d[1])
      .curve(d3.curveMonotoneX);

    const ordered = Object.keys(this.data)
      .sort((a, b) => {
        return new Date(b).getTime() - new Date(a).getTime();
      })
      .reduce((obj, key) => {
        (obj as any)[key] = this.data[key];
        return obj;
      }, {});
    console.log(ordered);
    let dates = Object.keys(ordered).map((d) => new Date(d));
    let articles: number[] = Object.values(ordered);

    const pointsCovid: [number, number][] = this.covidData.map((d) => [
      this.xScale!(new Date(d['Date de déclaration du cas'])) as number,
      this.yScale!(d['Cas confirmés']) as number,
    ]);

    const points: [number, number][] = [];
    for (let i = 0; i < dates.length; i++) {
      points.push([
        this.xScale!(dates[i]) as number,
        this.yScale!(articles[i]) as number,
      ]);
    }
    this.lineGroup!.attr('d', line(points));
    this.lineGroupCovid!.attr('d', line(pointsCovid));

    this.svgInner!.append('text')
      .attr('x', this.width / 4)
      .attr('y', 0 - this.margin / 2)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .style('text-decoration', 'underline')
      .text(
        "Nombre d'articles portant sur la COVID/ Nombre de cas de COVID par jour"
      );

    this.svgInner!.append('circle')
      .attr('cx', 200)
      .attr('cy', 130)
      .attr('r', 6)
      .style('fill', 'red');
    this.svgInner!.append('circle')
      .attr('cx', 200)
      .attr('cy', 160)
      .attr('r', 6)
      .style('fill', 'blue');
    this.svgInner!.append('text')
      .attr('x', 220)
      .attr('y', 130)
      .text("Nombre d'articles")
      .style('font-size', '15px')
      .attr('alignment-baseline', 'middle');
    this.svgInner!.append('text')
      .attr('x', 220)
      .attr('y', 160)
      .text('Cas de Covid')
      .style('font-size', '15px')
      .attr('alignment-baseline', 'middle');
  }
}

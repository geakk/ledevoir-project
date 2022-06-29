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
  private margin = { top: 40, right: 0, bottom: 0, left: 70 };
  
  private width = 800 - this.margin.left - this.margin.right;
  private height = 700 - this.margin.top - this.margin.bottom;

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
    private dataService: DataService
  ) {}

  ngAfterViewInit(): void {
    this.data = this.dataService.getNbArticlesByDay(this.articlesData);
    this.initializeChart();
    this.drawChart();
  }

  public ngOnChanges(changes: { hasOwnProperty: (arg0: string) => any }): void {
    if (changes.hasOwnProperty('data') && this.data) {
      this.initializeChart();
      this.drawChart();

      window.addEventListener('resize', () => this.drawChart());
    }
  }

  private initializeChart(): void {
    let casCovid = this.covidData.map((d) => d['Cas confirmés']);
    let dates = Object.keys(this.data).map((d) => new Date(d));
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
      .attr('width', this.width)
      .attr('height', this.height);

    this.svgInner = this.svg
      .append('g')
      .style(
        'transform',
        'translate(' + this.margin.left + ',' + this.margin.top  + ')'
      );

    this.yScale = d3
      .scaleLinear()
      .domain([Math.max(...casCovid) + 1, Math.min(...casCovid) - 1])
      .range([this.margin.top, this.height - 2 * this.margin.top]);

    this.yAxis = this.svgInner
      .append('g')
      .attr('id', 'y-axis')
      .style('transform', 'translate(' + this.margin.left + 'px,  0)');

    this.xScale = d3
      .scaleTime()
      .domain([minDate, maxDate])
      .range([this.margin.left, this.width - 2 * this.margin.right]);

    this.xAxis = this.svgInner
      .append('g')
      .attr('id', 'x-axis')
      .style(
        'transform',
        'translate(0, ' + (this.height - 2 * this.margin.top) + 'px)'
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

    this.addTitle();
    this.addLegend();
    this.addLabels();
  }

  private addTitle(){
    this.svg!.append('text')
      .attr('x', this.width / 2)
      .attr('y', 15)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .style('text-decoration', 'underline')
      .text(
        "Nombre d'articles portant sur la COVID/ Nombre de cas de COVID par jour"
      );
  }
  private addLabels(){
    this.svgInner!.append("text")
    .attr("class", "x label")
    .attr("text-anchor", "end")
    .attr("x", this.width/2)
    .attr("y", this.height - this.margin.top)
    .text("Date");
    this.addLegend();

    this.svgInner!.append("text")
    .attr("class", "y label")
    .attr("text-anchor", "end")
    .attr("x", -200)
    .attr("y", 6)
    .attr("dy", ".75em")
    .attr("transform", "rotate(-90)")
    .text("Nombres d'articles / Nombre de cas");
  }

  private addLegend() {
    this.svgInner!.append('circle')
      .attr('cx', 100)
      .attr('cy', 60)
      .attr('r', 6)
      .style('fill', 'red');
    this.svgInner!.append('circle')
      .attr('cx', 100)
      .attr('cy', 90)
      .attr('r', 6)
      .style('fill', 'blue');
    this.svgInner!.append('text')
      .attr('x', 120)
      .attr('y', 60)
      .text("Nombre d'articles")
      .style('font-size', '15px')
      .attr('alignment-baseline', 'middle');
    this.svgInner!.append('text')
      .attr('x', 120)
      .attr('y', 90)
      .text('Cas de Covid')
      .style('font-size', '15px')
      .attr('alignment-baseline', 'middle');
  }
}

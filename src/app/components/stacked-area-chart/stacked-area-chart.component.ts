import { AfterViewInit, Component, ElementRef, Input } from '@angular/core';
import * as d3 from 'd3';
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
  public data: CategoryFrequencyPerDay[] = [];

  private margin = { top: 50, right: 230, bottom: 50, left: 50 };
  private width = 600 - this.margin.left - this.margin.right;
  private height = 400 - this.margin.top - this.margin.bottom;
  private idleTimeout: any | null;
  private x!: d3.ScaleLinear<number, number, never>;
  private areaChart!: d3.Selection<SVGGElement, unknown, null, undefined>;
  private brush!: d3.BrushBehavior<unknown>;
  private xAxis!: d3.Selection<SVGGElement, unknown, null, undefined>;
  private area!: d3.Area<[number, number]>;
  private keys = [
    'Arts_and_Entertainment',
    'Business',
    'Environment',
    'Health',
    'Politics',
    'Science',
    'Sports',
    'Technology',
  ];
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
    const svg = d3
      .select(this.chartElem.nativeElement)
      .select('.stacked-area-chart')
      .append('svg')
      .attr('width', this.width + this.margin.left + this.margin.right)
      .attr('height', this.height + this.margin.top + this.margin.bottom)
      .append('g')
      .style(
        'transform',
        'translate(' + this.margin.left + ',' + this.margin.top + ')'
      );

    let color = d3.scaleOrdinal().domain(this.keys).range(d3.schemeSet2);
    let stackedData = d3.stack().keys(this.keys)(this.data as any);

    this.x = this.getXScale(this.data);
    this.xAxis = svg
      .append('g')
      .attr('transform', 'translate(0,' + this.height + ')')
      .call(d3.axisBottom(this.x).ticks(6));

    svg
      .append('text')
      .attr('text-anchor', 'end')
      .attr('x', this.width)
      .attr('y', this.height + 40)
      .text('Time(Year)');
    svg
      .append('text')
      .attr('text-anchor', 'end')
      .attr('x', 0)
      .attr('y', -20)
      .text('nombre de reportage')
      .attr('text-anchor', 'start');

    const y = this.getYScale();
    svg.append('g').call(d3.axisLeft(y).ticks(5));

    let clip = svg
      .append('defs')
      .append('svg:clipPath')
      .attr('id', 'clip')
      .append('svg:rect')
      .attr('width', this.width)
      .attr('height', this.height)
      .attr('x', 0)
      .attr('y', 0);

    this.brush = d3
      .brushX()
      .extent([
        [0, 0],
        [this.width, this.height],
      ])
      .on('end', this.updateChart);

    this.areaChart = svg.append('g').attr('clip:path', 'url(#clip)');

    this.area = d3
      .area()
      .x((d: any) => {
        return this.x(d.data.date);
      })
      .y0((d) => {
        return y(d[0]);
      })
      .y1((d) => {
        return y(d[1]);
      });
    this.areaChart
      .selectAll('mylayers')
      .data(stackedData)
      .enter()
      .append('path')
      .attr('class', (d) => {
        return 'MyArea' + d.key;
      })
      .style('fill', (d) => {
        return color(d.key) as any;
      })
      .attr('d', this.area as any);
    this.areaChart.append('g').attr('class', 'brush').call(this.brush);

    const size = 20;
    svg
      .selectAll('myrect')
      .data(this.keys)
      .join('rect')
      .attr('x', 400)
      .attr('y', (d, i) => {
        return 10 + i * (size + 5);
      })
      .attr('width', size)
      .attr('height', size)
      .style('fill', (d) => {
        return color(d) as any;
      })
      .on('mouseover', this.highlight)
      .on('mouseleave', this.nonHighlight);
    svg
      .selectAll('mylabels')
      .data(this.keys)
      .join('text')
      .attr('x', 400 + size * 1.2)
      .attr('y', (d, i) => {
        return 10 + i * (size + 5) + size / 2;
      })
      .style('fill', (d) => {
        return color(d) as any;
      })
      .text((d) => {
        return d;
      })
      .attr('text-anchor', 'left')
      .style('alignment-baseline', 'middle')
      .on('mouseover', this.highlight)
      .on('mouseleave', this.nonHighlight);
  }

  getXScale(data: CategoryFrequencyPerDay[]) {
    return d3
      .scaleLinear()
      .domain([
        d3.min(data, function (d: any) {
          return d.date;
        }),
        d3.max(data, function (d: any) {
          return d.date;
        }),
      ])
      .range([0, this.width]);
  }

  getYScale() {
    return d3.scaleLinear().domain([0, 500]).range([this.height, 0]);
  }

  updateChart(event: any, d: any) {
    const extent = event.selection;
    if (!extent) {
      if (!this.idleTimeout)
        return (this.idleTimeout = setTimeout(this.idled, 350));
      this.x.domain([
        d3.min(this.data, function (d: any) {
          return d.date;
        }),
        d3.max(this.data, function (d: any) {
          return d.date;
        }),
      ]);
    } else {
      this.x.domain([this.x.invert(extent[0]), this.x.invert(extent[1])]);
      this.areaChart.select('.brush').call(this.brush.move as any, null);
    }
    this.xAxis.transition().duration(1000).call(d3.axisBottom(this.x).ticks(5));
    this.areaChart
      .selectAll('path')
      .transition()
      .duration(1000)
      .attr('d', this.area as any);
    return;
  }

  highlight(event: any, d: any) {
    d3.selectAll('.myArea').style('opcaity', 0.1);
    d3.select('.' + d).style('opacity', 1);
  }
  nonHighlight(event: any, d: any) {
    d3.select('.myArea').style('opacity', 1);
  }

  idled() {
    this.idleTimeout = null;
  }
}

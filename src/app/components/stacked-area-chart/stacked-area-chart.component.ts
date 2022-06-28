import { AfterViewInit, Component, ElementRef, Input } from '@angular/core';
import { MatSelectChange } from '@angular/material/select';
import * as d3 from 'd3';


import {
  CategoryFrequencyPerDay,
  Covid,
  DataEntry,
} from '../../interfaces/data-entry.interface';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-stacked-area-chart',
  templateUrl: './stacked-area-chart.component.html',
  styleUrls: ['./stacked-area-chart.component.scss'],
})
export class StackedAreaChartComponent implements AfterViewInit {
  @Input() articlesData: DataEntry[] = [];
  @Input() covidData: Covid[] = [];
  public data: CategoryFrequencyPerDay[] = [];
  public articleDataByDay: CategoryFrequencyPerDay[] = [];
  public selected = 'Vague 1';


  private margin = { top: 50, right: 230, bottom: 50, left: 50 };
  private width = 800 - this.margin.left - this.margin.right;
  private height = 700 - this.margin.top - this.margin.bottom;
  private color!: d3.ScaleOrdinal<string, unknown, never>;
  private stackedData!: d3.Series<{ [key: string]: number; }, string>[];
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
  private size = 20;
  public xScale: d3.AxisScale<Date> | undefined;
  constructor(
    public chartElem: ElementRef,
    private dataService: DataService
  ) {}

  ngAfterViewInit(): void {
    this.articleDataByDay = this.dataService.getArticleByDay(this.articlesData);
    this.data = this.dataService.getDataByWave('first', this.articleDataByDay);
    this.color = d3.scaleOrdinal().domain(this.keys).range(d3.schemeSet2);

    this.stackedData = d3.stack().keys(this.keys)(this.data as any);
    this.createChart();
  }

  createChart() {
    const svg = d3
      .select(this.chartElem.nativeElement)
      .append('svg')
      .attr('class', 'stacked-area-chart')
      .attr('width', this.width + this.margin.left + this.margin.right)
      .attr('height', this.height + this.margin.top + this.margin.bottom)
      .append('g')
      .style(
        'transform',
        'translate(' + this.margin.left + ',' + this.margin.top + ')'
      );
    let x = this.getXScale(this.data);

    svg
      .append('g')
      .attr('transform', 'translate('+this.margin.left +',' + (this.height+this.margin.top) + ')')
      .call(d3.axisBottom(x).ticks(6));

    svg
      .append('text')
      .attr('text-anchor', 'end')
      .attr('x', this.width)
      .attr('y', this.height + this.margin.top+40)
      .text('Time(Year)');

    svg
      .append('text')
      .attr('text-anchor', 'end')
      .attr('x', this.margin.left)
      .attr('y',  this.margin.top -20)
      .text('#number of news reports')
      .attr('text-anchor', 'start');

    const y = this.getYScale();
    svg.append('g').attr('transform', 'translate(' + this.margin.left + ','+ this.margin.top+ ')')
    .call(d3.axisLeft(y).ticks(5));

    this.createArea(svg,x,y) 
    this.createLablels(svg)

    
  }

  updateData(event: MatSelectChange): void {
    this.data = this.dataService.getDataByWave(event.value, this.articleDataByDay);
    this.stackedData = d3.stack().keys(this.keys)(this.data as any);
    d3.selectAll('.stacked-area-chart').remove();
    this.createChart();
  }

  private createArea(svg: d3.Selection<SVGGElement, unknown, null, undefined>,x: d3.ScaleTime<number,number,never>,y:d3.ScaleLinear<number, number, never> ){

    let area = d3
    .area()
    .x((d: any) => x(d.data.date))
    .y1((d) => {
      return y(d[1]);
    })
    .y0((d) => {
      return y(d[0]);
    })
    .curve(d3.curveMonotoneX);

  svg
    .selectAll('mylayers')
    .data(this.stackedData)
    .enter()
    .append('path')
    .attr('class', (d:any) => {
      return 'myArea ' + d.key;
    })
    .style('fill', (d: any) => {
      return this.color(d) as any;
    })
    .attr('stroke', (d: any) => {
      return this.color(d) as any;
    })
    .attr('stroke-width', 2)
    .attr('d', area as any)
    .attr('transform', 'translate('+ this.margin.left + ',' +this.margin.top + ')');
  };
    

  private createLablels(svg: d3.Selection<SVGGElement, unknown, null, undefined>){

    svg
    .selectAll('myrect')
    .data(this.keys)
    .join('rect')
    .attr('x', 400)
    .attr('y', (_d: any, i: any) => {
      return 10 + i * (this.size + 5);
    })
    .attr('width', this.size)
    .attr('height', this.size)
    .style('fill', (d: any) => {
      return this.color(d) as any;
    })
    .on('mouseover', this.highlight)
    .on('mouseleave', this.nonHighlight);

  svg
    .selectAll('mylabels')
    .data(this.keys)
    .join('text')
    .attr('x', 400 + this.size * 1.2)
    .attr('y', (_d, i) => {
      return 10 + i * (this.size + 5) + this.size / 2;
    })
    .style('fill', (d) => {
      return this.color(d) as any;
    })
    .text((d) => {
      return d;
    })
    .attr('text-anchor', 'left')
    .style('alignment-baseline', 'middle')
    .on('mouseover', this.highlight)
    .on('mouseleave', this.nonHighlight);
  }

  private getXScale(data: CategoryFrequencyPerDay[]) {
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
      .range([0, this.width]);
  }

  private getYScale() {
    return d3.scaleLinear().domain([0, 500]).range([this.height, 0]);
  }


  private highlight(_event: any, d: any) {
    d3.selectAll('.myArea').style('opacity', 0.1);
    d3.select('.' + d).style('opacity', 1);
  }
  private nonHighlight(_event: any, _d: any) {
    d3.selectAll('.myArea').style('opacity', 1);
  }

}

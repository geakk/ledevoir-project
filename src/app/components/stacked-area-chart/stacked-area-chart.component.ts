import { AfterViewInit, Component, ElementRef, Input } from '@angular/core';
import { MatSelectChange } from '@angular/material/select';
import * as d3 from 'd3';

import {
  firstWaveEndDate,
  firstWaveStartDate,
  fivethWaveEndDate,
  fivethWaveStartDate,
  fourthWaveEndDate,
  fourthWaveStartDate,
  secondWaveEndDate,
  secondWaveStartDate,
  sixthWaveEndDate,
  sixthWaveStartDate,
  thirdWaveEndDate,
  thirdWaveStartDate,
} from 'src/app/constants/themes';
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
  public articleDataByDay: CategoryFrequencyPerDay[] = [];
  public selected = 'Vague 1';


  private margin = { top: 50, right: 230, bottom: 50, left: 50 };
  private width = 800 - this.margin.left - this.margin.right;
  private height = 700 - this.margin.top - this.margin.bottom;
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
    this.articleDataByDay = this.dataService.getArticleByDay(this.articlesData);
    this.data = this.getDataByWave('first');
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
    const color = d3.scaleOrdinal().domain(this.keys).range(d3.schemeSet2);

    let stackedData = d3.stack().keys(this.keys)(this.data as any);
    let x = this.getXScale(this.data);

    let xAxis = svg
      .append('g')
      .attr('transform', 'translate(0,' + (this.height - 2 * this.margin.top)  + 'px)')
      .call(d3.axisBottom(x).ticks(6));

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
      .text('# nombre de reportage')
      .attr('text-anchor', 'start');

    const y = this.getYScale();
    svg.append('g').attr('transform', 'translate(' + this.margin.left + 'px, 0)')
    .call(d3.axisLeft(y).ticks(5));

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
      .data(stackedData)
      .enter()
      .append('path')
      .attr('class', (d) => {
        return 'myArea ' + d.key;
      })
      .style('fill', (d: any) => {
        return color(d) as any;
      })
      .attr('stroke', (d: any) => {
        return color(d) as any;
      })
      .attr('stroke-width', 2)
      .attr('d', area as any)
      

    const size = 20;

    svg
      .selectAll('myrect')
      .data(this.keys)
      .join('rect')
      .attr('x', 400)
      .attr('y', (_d: any, i: any) => {
        return 10 + i * (size + 5);
      })
      .attr('width', size)
      .attr('height', size)
      .style('fill', (d: any) => {
        return color(d) as any;
      })
      .on('mouseover', this.highlight)
      .on('mouseleave', this.nonHighlight);

    svg
      .selectAll('mylabels')
      .data(this.keys)
      .join('text')
      .attr('x', 400 + size * 1.2)
      .attr('y', (_d, i) => {
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
      .scaleTime()
      .domain([
        d3.min(data, function (d: any) {
          return d.date;
        }),
        d3.max(data, function (d: any) {
          return d.date;
        }),
      ])
      .range([this.margin.top, this.width - 2 * this.margin.top]);
  }

  getYScale() {
    return d3.scaleLinear().domain([0, 500]).range([0, this.height - 2 * this.margin.left]);

  }

  highlight(_event: any, d: any) {
    d3.selectAll('.myArea').style('opacity', 0.1);
    d3.select('.' + d).style('opacity', 1);
  }
  nonHighlight(_event: any, _d: any) {
    d3.selectAll('.myArea').style('opacity', 1);
  }

  getToolTipHtml(d: any) {
    return `<div>date : <span class="tooltip-value">${d.date} </span></div>
    <div> Articles de categorie Arts_and_Entertainment :  <span class="tooltip-value">${d.Arts_and_Entertainment}</span></div>
    <div> Articles de categorie Business :  <span class="tooltip-value">${d.Business} </span></div>
    <div> Articles de categorie Environment :  <span class="tooltip-value">${d.Environment} </span></div>
    <div> Articles de categorie Health : <span class="tooltip-value">${d.Health} </span> </div>
    <div> Articles de categorie Politics :  <span class="tooltip-value">${d.Politics} </span></div>
    <div> Articles de categorie Science :  <span class="tooltip-value">${d.Science} </span></div>
    <div> Articles de categorie Sports :  <span class="tooltip-value">${d.Sports} </span></div>
    <div> Articles de categorieTechnology :  <span class="tooltip-value">${d.Science} </span></div>`
      
  }


  getDataByWave(wave: string): CategoryFrequencyPerDay[] {
    let data: CategoryFrequencyPerDay[] = [];
    switch (wave) {
      case 'first':
        data = this.articleDataByDay.filter((d) => {
          return (
            d.date.getTime() <= firstWaveEndDate.getTime() &&
            d.date.getTime() >= firstWaveStartDate.getTime()
          );
        });
        break;
      case 'second':
        data = this.articleDataByDay.filter((d) => {
          return (
            d.date.getTime() <= secondWaveEndDate.getTime() &&
            d.date.getTime() >= secondWaveStartDate.getTime()
          );
        });
        break;
      case 'third':
        data = this.articleDataByDay.filter((d) => {
          return (
            d.date.getTime() <= thirdWaveEndDate.getTime() &&
            d.date.getTime() >= thirdWaveStartDate.getTime()
          );
        });
        break;
      case 'fourth':
        data = this.articleDataByDay.filter((d) => {
          return (
            d.date.getTime() <= fourthWaveEndDate.getTime() &&
            d.date.getTime() >= fourthWaveStartDate.getTime()
          );
        });
        break;
      case 'fifth':
        data = this.articleDataByDay.filter((d) => {
          return (
            d.date.getTime() <= fivethWaveEndDate.getTime() &&
            d.date.getTime() >= fivethWaveStartDate.getTime()
          );
        });
        break;
      case 'six':
        data = this.articleDataByDay.filter((d) => {
          return (
            d.date.getTime() <= sixthWaveEndDate.getTime() &&
            d.date.getTime() >= sixthWaveStartDate.getTime()
          );
        });
        break;
    }
    return data;
  }

  updateData(event: MatSelectChange): void {
    this.data = this.getDataByWave(event.value);
    d3.selectAll('.stacked-area-chart').remove();
    this.createChart();
  }
}

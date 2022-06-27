import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';

import * as d3 from 'd3';
import { WordData } from 'src/app/interfaces/data-entry.interface';
@Component({
  selector: 'app-bar-chart',
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.scss'],
})
export class BarChartComponent implements AfterViewInit {
  constructor() {}

  @ViewChild('barChart')
  private chartContainer!: ElementRef;
  selected = 'Vague 1';
  data!: WordData[];
  margin = { top: 20, right: 20, bottom: 30, left: 80 };
  waves = [
    [
      { word: 'Covid', frequency: 12222 },
      { word: 'Rds', frequency: 3230 },
      { word: 'Québec', frequency: 2937 },
      { word: 'Pandémie', frequency: 2076 },
      { word: 'Ontario', frequency: 1949 },
    ],
    [
      { word: 'Covid', frequency: 15394 },
      { word: 'Québec', frequency: 4224 },
      { word: 'Rds', frequency: 2512 },
      { word: 'Pandémie', frequency: 2491 },
      { word: 'Ontario', frequency: 2211 },
    ],
    [
      { word: 'Covid', frequency: 6416 },
      { word: 'Québec', frequency: 2097 },
      { word: 'Ontario', frequency: 1449 },
      { word: 'Vaccination', frequency: 1397 },
      { word: 'Rds', frequency: 1231 },
    ],
    [
      { word: 'Covid', frequency: 6442 },
      { word: 'Vaccination', frequency: 1620 },
      { word: 'Québec', frequency: 1574 },
      { word: 'Rds', frequency: 1355 },
      { word: 'Ontario', frequency: 1256 },
    ],
    [
      { word: 'Covid', frequency: 5438 },
      { word: 'Rds', frequency: 1733 },
      { word: 'Québec', frequency: 1553 },
      { word: 'Omicron', frequency: 1077 },
      { word: 'Hospitalisations', frequency: 878 },
    ],
  ];

  ngAfterViewInit(): void {
    this.data = this.waves[0];
    this.createChart();
  }

  // create function with d3 to create a bar chart
  private createChart(): void {
    const element = this.chartContainer.nativeElement;
    const data = this.data;

    const svg = d3
      .select(element)
      .append('svg')
      .attr('class', 'barChar')
      .attr('width', element.offsetWidth)
      .attr('height', element.offsetHeight);
    const contentHeight =
      element.offsetHeight - this.margin.top - this.margin.bottom;

    const x = d3
      .scaleBand()
      .rangeRound([0, 500])
      .padding(0.1)
      .domain(data.map((d) => d.word));

    const y = d3
      .scaleLinear()
      .rangeRound([contentHeight, 0])
      .domain([0, d3.max(data, (d) => d.frequency as any)]);

    const g = svg
      .append('g')
      .attr(
        'transform',
        'translate(' + this.margin.left + ',' + this.margin.top + ')'
      );

    g.append('g')
      .attr('class', 'axis axis--x')
      .style('font', '15px times')
      .attr('transform', 'translate(0,' + contentHeight + ')')
      .call(d3.axisBottom(x));

    g.append('g')
      .attr('class', 'axis axis--y')
      .style('font', '15px times')
      .call(d3.axisLeft(y).ticks(10))
      .append('text')
      .attr('y', 6);

    g.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', (d) => x(d.word) as any)
      .attr('y', (d) => y(d.frequency))
      .attr('width', x.bandwidth())
      .attr('fill', '#69b3a2')
      .attr('height', (d) => contentHeight - y(d.frequency));
  }

  updateData(event: MatSelectChange): void {
    this.data = this.waves[Number(event.value)];
    d3.selectAll('.barChar').remove();
    this.createChart();
  }
}

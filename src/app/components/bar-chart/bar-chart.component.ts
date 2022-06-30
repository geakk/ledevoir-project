import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatSelectChange } from '@angular/material/select';

import * as d3 from 'd3';

import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';

import { MatSelectChange } from '@angular/material/select';
import { WordData } from 'src/app/interfaces/data-entry.interface';

@Component({
  selector: 'app-bar-chart',
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.scss'],
})
export class BarChartComponent implements AfterViewInit, OnInit {
  constructor() {}

  @ViewChild('barChart', { static: true })
  private chartContainer!: ElementRef;
  data!: WordData[];
  selected = '0';
  margin = { top: 20, right: 20, bottom: 30, left: 120 };
  waves = [
    [
      { word: 'Covid', frequency: 48155 },
      { word: 'Québec', frequency: 13038 },
      { word: 'Rds', frequency: 11232 },
      { word: 'Ontario', frequency: 8104 },
      { word: 'Pandémie', frequency: 7102 },
    ],
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
    this.createChart();
  }
  // make waves[0] as default value of the chart's data when page loads and update the chart
  updateDataDefault(): void {
    this.data = this.waves[0];
    this.createChart();
  }
  ngOnInit(): void {
    this.updateDataDefault();
  }

  private createChart(): void {
    const element = this.chartContainer.nativeElement;
    const data = this.data;
    console.log(this.data)

    const svg = d3
      .select(element)
      .append('svg')
      .attr('class', 'barChar')
      .attr('width', element.offsetWidth + this.margin.left + this.margin.right)
      .attr(
        'height',
        element.offsetHeight + this.margin.top + this.margin.bottom
      );

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

    // add title to x axis and y axis to the svg element and set the font size to 15px and set the font family to times and give enough space for the title to be displayed and the axis to be displayed properly and take into account the margin and fequency number size on the waves array

    svg
      .append('text')
      .attr('x', (element.offsetWidth / 2) - this.margin.left)
      .attr('y', -this.margin.top)
      .attr('text-anchor', 'middle')
      .style('font', '15px times')
      .text('Mots');

    svg
      .append('text')
      .attr('x', -(element.offsetHeight / 2))
      .attr('y', 40)
      .attr('transform', 'rotate(-90)')
      .attr('text-anchor', 'middle')
      .style('font', '15px times')
      .text("Fréquence d'apparition");



    // add title to the chart
    svg
      .append('text')
      .attr('class', 'chart-title')
      .attr('x', 500 / 2)
      .attr('y', -40)
      .attr('font-size', '20px')
      .attr('font-family', 'times')
      .attr('color', '#69b3a2')
      .attr('text-anchor', 'middle')
      .text('Covid-19 Word Frequency');
  }

  updateData(event: MatSelectChange): void {
    this.data = this.waves[Number(event.value)];
    d3.selectAll('.barChar').remove();
    this.createChart();
  }
}

import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatSelectChange } from '@angular/material/select';
// eslint-disable-next-line sort-imports
import * as d3 from 'd3';
import { WordData } from 'src/app/interfaces/data-entry.interface';

@Component({
  selector: 'app-bar-chart',
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.scss'],
})
export class BarChartComponent implements OnInit {
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

  ngOnInit(): void {
    this.data = this.waves[0];
    this.createChart();
  }

  private createChart(): void {
    const element = this.chartContainer.nativeElement;
    const data = this.data;

    const svg = d3
      .select(element)
      .append('svg')
      .attr('class', 'barChar')
      .attr('width', 800 + this.margin.left + this.margin.right)
      .attr('height', 400 + this.margin.top + this.margin.bottom);

    const contentHeight = 400 - this.margin.top - this.margin.bottom;
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
      .attr('transform', 'translate(' + this.margin.left + ',' + 0 + ')');

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

    svg
      .append('g')
      .append('text')
      .attr('x', 375)
      .attr('y', 400)
      .attr('text-anchor', 'middle')
      .style('font', '15px times')
      .style('fill', '#000')
      .text('Mots');

    svg
      .append('text')
      .attr('x', -(400 / 2))
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
      .text('Fréquences des mots dans les articles pendant la Covid-19 ');
  }

  updateData(event: MatSelectChange): void {
    this.data = this.waves[Number(event.value)];
    d3.selectAll('.barChar').remove();
    this.createChart();
  }
}

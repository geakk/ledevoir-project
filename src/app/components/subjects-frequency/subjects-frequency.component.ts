import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
} from '@angular/core';
import * as d3 from 'd3';
import { DataEntry } from 'src/app/interfaces/data-entry.interface';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-subjects-frequency',
  templateUrl: './subjects-frequency.component.html',
  styleUrls: ['./subjects-frequency.component.scss'],
})
export class SubjectsFrequencyComponent implements OnChanges, AfterViewInit {
  @Input() articlesData: DataEntry[] = [];
  public arts_and_entertainment:
    | d3.Selection<SVGPathElement, unknown, null, undefined>
    | undefined;
  public business:
    | d3.Selection<SVGPathElement, unknown, null, undefined>
    | undefined;
  public environment:
    | d3.Selection<SVGPathElement, unknown, null, undefined>
    | undefined;
  public health:
    | d3.Selection<SVGPathElement, unknown, null, undefined>
    | undefined;
  public politics:
    | d3.Selection<SVGPathElement, unknown, null, undefined>
    | undefined;
  public science:
    | d3.Selection<SVGPathElement, unknown, null, undefined>
    | undefined;
  public sports:
    | d3.Selection<SVGPathElement, unknown, null, undefined>
    | undefined;
  public technology:
    | d3.Selection<SVGPathElement, unknown, null, undefined>
    | undefined;

  private margin = { top: 50, right: 230, bottom: 50, left: 50 };
  private width = 800 - this.margin.left - this.margin.right;
  private height = 700 - this.margin.top - this.margin.bottom;

  public svg: d3.Selection<SVGSVGElement, unknown, null, undefined> | undefined;
  public svgInner:
    | d3.Selection<SVGGElement, unknown, null, undefined>
    | undefined;
  public yScale: d3.AxisScale<number> | undefined;
  public xScale: d3.AxisScale<number> | undefined;
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
    this.data = this.dataService.getCategoryOccurence(this.articlesData);
    this.initializeChart();
    this.drawChart();
  }

  public ngOnChanges(changes: { hasOwnProperty: (args: any) => any }): void {
    // eslint-disable-next-line no-prototype-builtins
    if (changes.hasOwnProperty('data') && this.data) {
      // console.log(this.data);
      this.initializeChart();
      this.drawChart();

      window.addEventListener('resize', () => this.drawChart());
    }
  }

  private initializeChart(): void {
    this.svg = d3
      .select(this.chartElem.nativeElement)
      .select('.subject-frequency')
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height)
      .style('margin-left', 'auto')
      .style('margin-right', 'auto');
    this.svgInner = this.svg
      .append('g')
      .style(
        'transform',
        'translate(' + this.margin.left + ',' + this.margin.top + ')'
      );

    this.yScale = d3
      .scaleLinear()
      .domain([12000, 0])
      .range([10, this.height - 2 * this.margin.left]);

    this.yAxis = this.svgInner
      .append('g')
      .attr('id', 'y-axis')
      .style('transform', 'translate(' + this.margin.left + 'px,  0)');

    this.xScale = d3
      .scaleLinear()
      .domain([1, 5])
      .range([this.margin.top, this.width - 2 * this.margin.top]);

    this.xAxis = this.svgInner
      .append('g')
      .attr('id', 'x-axis')
      .style(
        'transform',
        'translate(0, ' + (this.height - 2 * this.margin.top) + 'px)'
      );

    this.arts_and_entertainment = this.svgInner
      .append('g')
      .append('path')
      .attr('id', 'line')
      .style('fill', 'none')
      .style('stroke', 'blue')
      .style('stroke-width', '2px');

    this.business = this.svgInner
      .append('g')
      .append('path')
      .attr('id', 'line')
      .style('fill', 'none')
      .style('stroke', 'red')
      .style('stroke-width', '2px');

    this.environment = this.svgInner
      .append('g')
      .append('path')
      .attr('id', 'line')
      .style('fill', 'none')
      .style('stroke', 'black')
      .style('stroke-width', '2px');

    this.health = this.svgInner
      .append('g')
      .append('path')
      .attr('id', 'line')
      .style('fill', 'none')
      .style('stroke', 'green')
      .style('stroke-width', '2px');

    this.politics = this.svgInner
      .append('g')
      .append('path')
      .attr('id', 'line')
      .style('fill', 'none')
      .style('stroke', 'yellow')
      .style('stroke-width', '2px');

    this.science = this.svgInner
      .append('g')
      .append('path')
      .attr('id', 'line')
      .style('fill', 'none')
      .style('stroke', 'orange')
      .style('stroke-width', '2px');

    this.sports = this.svgInner
      .append('g')
      .append('path')
      .attr('id', 'line')
      .style('fill', 'none')
      .style('stroke', 'gray')
      .style('stroke-width', '2px');

    this.technology = this.svgInner
      .append('g')
      .append('path')
      .attr('id', 'line')
      .style('fill', 'none')
      .style('stroke', 'brown')
      .style('stroke-width', '2px');
  }

  private drawChart(): void {
    this.svg!.attr('width', this.width);

    const xAxis = d3.axisBottom(this.xScale!).ticks(5);

    this.xAxis!.call(xAxis);

    const yAxis = d3.axisLeft(this.yScale!);

    this.yAxis!.call(yAxis);

    const line = d3
      .line()
      .x((d) => d[0])
      .y((d) => d[1])
      .curve(d3.curveMonotoneX);

    let dates = [1, 2, 3, 4, 5];

    const artsPoints: [number, number][] = [];
    const businessPoints: [number, number][] = [];
    const environmentPoints: [number, number][] = [];
    const healthPoints: [number, number][] = [];
    const politicsPoints: [number, number][] = [];
    const sciencePoints: [number, number][] = [];
    const sportsPoints: [number, number][] = [];
    const technologyPoints: [number, number][] = [];

    for (let i = 0; i < dates.length; i++) {
      let currentSubjectFrequency;
      switch (i) {
        case 0:
          currentSubjectFrequency =
            this.data['news/Arts_and_Entertainment'].firstWave;
          break;
        case 1:
          currentSubjectFrequency =
            this.data['news/Arts_and_Entertainment'].secondWave;
          break;
        case 2:
          currentSubjectFrequency =
            this.data['news/Arts_and_Entertainment'].thirdWave;
          break;
        case 3:
          currentSubjectFrequency =
            this.data['news/Arts_and_Entertainment'].fourthWave;
          break;
        case 4:
          currentSubjectFrequency =
            this.data['news/Arts_and_Entertainment'].fivethWave;
          break;
        default:
          break;
      }
      artsPoints.push([
        this.xScale!(dates[i]) as number,
        this.yScale!(currentSubjectFrequency) as number,
      ]);
    }

    for (let i = 0; i < dates.length; i++) {
      let currentSubjectFrequency;
      switch (i) {
        case 0:
          currentSubjectFrequency = this.data['news/Business'].firstWave;
          break;
        case 1:
          currentSubjectFrequency = this.data['news/Business'].secondWave;
          break;
        case 2:
          currentSubjectFrequency = this.data['news/Business'].thirdWave;
          break;
        case 3:
          currentSubjectFrequency = this.data['news/Business'].fourthWave;
          break;
        case 4:
          currentSubjectFrequency = this.data['news/Business'].fivethWave;
          break;
        default:
          break;
      }
      businessPoints.push([
        this.xScale!(dates[i]) as number,
        this.yScale!(currentSubjectFrequency) as number,
      ]);
    }

    for (let i = 0; i < dates.length; i++) {
      let currentSubjectFrequency;
      switch (i) {
        case 0:
          currentSubjectFrequency = this.data['news/Environment'].firstWave;
          break;
        case 1:
          currentSubjectFrequency = this.data['news/Environment'].secondWave;
          break;
        case 2:
          currentSubjectFrequency = this.data['news/Environment'].thirdWave;
          break;
        case 3:
          currentSubjectFrequency = this.data['news/Environment'].fourthWave;
          break;
        case 4:
          currentSubjectFrequency = this.data['news/Environment'].fivethWave;
          break;
        default:
          break;
      }
      environmentPoints.push([
        this.xScale!(dates[i]) as number,
        this.yScale!(currentSubjectFrequency) as number,
      ]);
    }

    for (let i = 0; i < dates.length; i++) {
      let currentSubjectFrequency;
      switch (i) {
        case 0:
          currentSubjectFrequency = this.data['news/Health'].firstWave;
          break;
        case 1:
          currentSubjectFrequency = this.data['news/Health'].secondWave;
          break;
        case 2:
          currentSubjectFrequency = this.data['news/Health'].thirdWave;
          break;
        case 3:
          currentSubjectFrequency = this.data['news/Health'].fourthWave;
          break;
        case 4:
          currentSubjectFrequency = this.data['news/Health'].fivethWave;
          break;
        default:
          break;
      }
      healthPoints.push([
        this.xScale!(dates[i]) as number,
        this.yScale!(currentSubjectFrequency) as number,
      ]);
    }

    for (let i = 0; i < dates.length; i++) {
      let currentSubjectFrequency;
      switch (i) {
        case 0:
          currentSubjectFrequency = this.data['news/Politics'].firstWave;
          break;
        case 1:
          currentSubjectFrequency = this.data['news/Politics'].secondWave;
          break;
        case 2:
          currentSubjectFrequency = this.data['news/Politics'].thirdWave;
          break;
        case 3:
          currentSubjectFrequency = this.data['news/Politics'].fourthWave;
          break;
        case 4:
          currentSubjectFrequency = this.data['news/Politics'].fivethWave;
          break;
        default:
          break;
      }
      politicsPoints.push([
        this.xScale!(dates[i]) as number,
        this.yScale!(currentSubjectFrequency) as number,
      ]);
    }

    for (let i = 0; i < dates.length; i++) {
      let currentSubjectFrequency;
      switch (i) {
        case 0:
          currentSubjectFrequency = this.data['news/Science'].firstWave;
          break;
        case 1:
          currentSubjectFrequency = this.data['news/Science'].secondWave;
          break;
        case 2:
          currentSubjectFrequency = this.data['news/Science'].thirdWave;
          break;
        case 3:
          currentSubjectFrequency = this.data['news/Science'].fourthWave;
          break;
        case 4:
          currentSubjectFrequency = this.data['news/Science'].fivethWave;
          break;
        default:
          break;
      }
      sciencePoints.push([
        this.xScale!(dates[i]) as number,
        this.yScale!(currentSubjectFrequency) as number,
      ]);
    }

    for (let i = 0; i < dates.length; i++) {
      let currentSubjectFrequency;
      switch (i) {
        case 0:
          currentSubjectFrequency = this.data['news/Sports'].firstWave;
          break;
        case 1:
          currentSubjectFrequency = this.data['news/Sports'].secondWave;
          break;
        case 2:
          currentSubjectFrequency = this.data['news/Sports'].thirdWave;
          break;
        case 3:
          currentSubjectFrequency = this.data['news/Sports'].fourthWave;
          break;
        case 4:
          currentSubjectFrequency = this.data['news/Sports'].fivethWave;
          break;
        default:
          break;
      }
      sportsPoints.push([
        this.xScale!(dates[i]) as number,
        this.yScale!(currentSubjectFrequency) as number,
      ]);
    }

    for (let i = 0; i < dates.length; i++) {
      let currentSubjectFrequency;
      switch (i) {
        case 0:
          currentSubjectFrequency = this.data['news/Technology'].firstWave;
          break;
        case 1:
          currentSubjectFrequency = this.data['news/Technology'].secondWave;
          break;
        case 2:
          currentSubjectFrequency = this.data['news/Technology'].thirdWave;
          break;
        case 3:
          currentSubjectFrequency = this.data['news/Technology'].fourthWave;
          break;
        case 4:
          currentSubjectFrequency = this.data['news/Technology'].fivethWave;
          break;
        default:
          break;
      }
      technologyPoints.push([
        this.xScale!(dates[i]) as number,
        this.yScale!(currentSubjectFrequency) as number,
      ]);
    }

    this.arts_and_entertainment!.attr('d', line(artsPoints));
    this.business!.attr('d', line(businessPoints));
    this.environment!.attr('d', line(environmentPoints));
    this.health!.attr('d', line(healthPoints));
    this.politics!.attr('d', line(politicsPoints));
    this.science!.attr('d', line(sciencePoints));
    this.sports!.attr('d', line(sportsPoints));
    this.technology!.attr('d', line(technologyPoints));

    this.svgInner!.append('text')
      .attr('x', this.width / 4)
      .attr('y', 0 - this.margin.top / 2)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .style('text-decoration', 'underline')
      .text(
        "Fréquence de parution d'articles selon la catégorie durant les vagues de contamination"
      );

    this.svgInner!.append('circle')
      .attr('cx', 200)
      .attr('cy', 10)
      .attr('r', 6)
      .style('fill', 'red');
    this.svgInner!.append('circle')
      .attr('cx', 200)
      .attr('cy', 30)
      .attr('r', 6)
      .style('fill', 'blue');
    this.svgInner!.append('circle')
      .attr('cx', 200)
      .attr('cy', 50)
      .attr('r', 6)
      .style('fill', 'black');
    this.svgInner!.append('circle')
      .attr('cx', 200)
      .attr('cy', 70)
      .attr('r', 6)
      .style('fill', 'green');
    this.svgInner!.append('circle')
      .attr('cx', 200)
      .attr('cy', 90)
      .attr('r', 6)
      .style('fill', 'yellow');
    this.svgInner!.append('circle')
      .attr('cx', 200)
      .attr('cy', 110)
      .attr('r', 6)
      .style('fill', 'orange');
    this.svgInner!.append('circle')
      .attr('cx', 200)
      .attr('cy', 130)
      .attr('r', 6)
      .style('fill', 'gray');
    this.svgInner!.append('circle')
      .attr('cx', 200)
      .attr('cy', 150)
      .attr('r', 6)
      .style('fill', 'brown');
    this.svgInner!.append('text')
      .attr('x', 220)
      .attr('y', 10)
      .text('Business')
      .style('font-size', '15px')
      .attr('alignment-baseline', 'middle');
    this.svgInner!.append('text')
      .attr('x', 220)
      .attr('y', 30)
      .text('Arts et divertissement')
      .style('font-size', '15px')
      .attr('alignment-baseline', 'middle');
    this.svgInner!.append('text')
      .attr('x', 220)
      .attr('y', 50)
      .text('Environnement')
      .style('font-size', '15px')
      .attr('alignment-baseline', 'middle');
    this.svgInner!.append('text')
      .attr('x', 220)
      .attr('y', 70)
      .text('Health')
      .style('font-size', '15px')
      .attr('alignment-baseline', 'middle');
    this.svgInner!.append('text')
      .attr('x', 220)
      .attr('y', 90)
      .text('Politique')
      .style('font-size', '15px')
      .attr('alignment-baseline', 'middle');
    this.svgInner!.append('text')
      .attr('x', 220)
      .attr('y', 110)
      .text('Science')
      .style('font-size', '15px')
      .attr('alignment-baseline', 'middle');
    this.svgInner!.append('text')
      .attr('x', 220)
      .attr('y', 130)
      .text('Sport')
      .style('font-size', '15px')
      .attr('alignment-baseline', 'middle');
    this.svgInner!.append('text')
      .attr('x', 220)
      .attr('y', 150)
      .text('Technologie')
      .style('font-size', '15px')
      .attr('alignment-baseline', 'middle');

    this.svgInner!.append('text')
      .attr('class', 'x label')
      .attr('text-anchor', 'end')
      .attr('x', this.width / 2 + this.margin.bottom)
      .attr('y', this.height - 70)
      .text('Vague de contamination');

    this.svgInner!.append('text')
      .attr('class', 'y label')
      .attr('text-anchor', 'end')
      .attr('x', -150)
      .attr('y', 0)
      .attr('dy', '.75em')
      .attr('transform', 'rotate(-90)')
      .text("Nombres d'articles");
  }
}

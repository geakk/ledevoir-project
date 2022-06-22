/* eslint-disable no-unused-vars */
import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { FilterEventsService } from 'src/app/services/filter-events.service';
import { RawDataEntry } from '../../interfaces/data-entry.interface';
import { ThemeService } from 'src/app/services/theme.service';

import * as d3 from 'd3';

interface bars {
  model_name: string;
  field1: number;
  field2: number;
}

interface Margin {
  left: number;
  right: number;
  bottom: number;
  top: number;
}

@Component({
  selector: 'app-course-comparison-view',
  templateUrl: './course-comparison-view.component.html',
  styleUrls: ['./course-comparison-view.component.scss'],
})
export class CourseComparisonViewComponent implements OnChanges, AfterViewInit {
  @Input() data: RawDataEntry[] = [];

  @ViewChild('histogramSVG')
  private histogramSVG: ElementRef<HTMLElement> | undefined;

  @ViewChild('toolTip')
  private toolTip: ElementRef<HTMLElement> | undefined;

  private svg: d3.Selection<HTMLElement, unknown, null, undefined> | undefined;

  private dataReady: any = [];
  private width: number = 0;
  private height: number = 0;
  private margin: Margin = { top: 30, right: 30, bottom: 125, left: 90 };
  private barPadding: number = 0.2;
  private axisTicksQuantity: number = 5;
  private xScale0: d3.ScaleBand<string> = d3.scaleBand();
  private xScale1: d3.ScaleBand<string> = d3.scaleBand();
  private yScale: d3.ScaleLinear<number, number, never> = d3.scaleLinear();
  private xAxis: d3.Axis<string> = d3.axisBottom(this.xScale0);
  private yAxis: d3.Axis<d3.NumberValue> = d3.axisLeft(this.yScale);

  constructor(
    private readonly host: ElementRef,
    private readonly theme: ThemeService,
    private readonly filterEventService: FilterEventsService
  ) {}

  ngAfterViewInit(): void {
    this.viz();
    const observer = new ResizeObserver(() => {
      this.viz();
    });
    observer.observe(this.host.nativeElement);
    this.theme.themeChange$.subscribe(() => {
      this.viz();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.data && !changes.data.firstChange) {
      this.viz();
    }
  }

  private viz(): void {
    this.setupSvg();
    this.updateData(this.data);
    this.drawViz();
  }

  private updateData(data: RawDataEntry[]): void {
    this.dataReady = this.preprocessData(data);
  }

  private setupSvg(): void {
    if (this.svg) {
      this.svg.remove();
    }
    this.toolTip!.nativeElement.style.display = 'none';
    const svgElement = this.histogramSVG!.nativeElement;

    const rect = svgElement.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height;
    d3.select(svgElement)
      .append('g')
      .attr(
        'transform',
        'translate(' + this.margin.left + ',' + this.margin.top + ')'
      );

    this.svg = d3.select(svgElement).select('g');
  }

  private defineChartProperties() {
    let models: bars[] = this.dataReady;
    this.xScale0 = d3
      .scaleBand()
      .range([0, this.width - this.margin.left - this.margin.right])
      .padding(this.barPadding);
    this.xScale1 = d3.scaleBand();
    this.yScale = d3
      .scaleLinear()
      .range([this.height - this.margin.top - this.margin.bottom, 0]);
    this.xAxis = d3.axisBottom(this.xScale0).tickSizeOuter(0);
    this.yAxis = d3.axisLeft(this.yScale).ticks(this.axisTicksQuantity);
    this.xScale0.domain(models.map((d) => d.model_name));
    this.xScale1
      .domain(['field1', 'field2'])
      .range([0, this.xScale0.bandwidth()]);
    this.yScale.domain([0, 100]);
  }

  private addBarsToSVG() {
    let models: bars[] = this.dataReady;
    let model_name = this.svg!.selectAll('.model_name')
      .data(models)
      .enter()
      .append('g')
      .attr('class', 'model_name')
      .attr('transform', (d) => `translate(${this.xScale0(d.model_name)},0)`);

    let tooltip = d3.select(this.toolTip!.nativeElement);

    let fields = ['field1', 'field2'];

    for (let field of fields) {
      model_name
        .selectAll('.bar.' + field)
        .data((d) => [d])
        .enter()
        .append('rect')
        .attr('class', 'bar' + field)
        .style(
          'fill',
          (field == 'field1'
            ? this.theme.currentTheme!.primary
            : this.theme.currentTheme!.accent) as string
        )
        .attr('x', () => this.xScale1(field) as number)
        .on('mouseenter', function (actual, i) {
          d3.select(this).attr('opacity', 0.5);
        })
        .on('mousemove', function (event, d) {
          let value = field == 'field1' ? d.field1 : d.field2;
          tooltip
            .html(Math.round(value * 100) / 100 + '%')
            .style('left', event.clientX + 5 + 'px')
            .style('top', event.clientY + 5 + 'px')
            .style('display', 'block');
          d3.select(this).style('opacity', 0.5);
        })
        .on('mouseleave', function (d) {
          d3.select(this).style('opacity', 1);
          tooltip.html(``).style('display', 'none');
        })
        .style('cursor', 'pointer')
        .on('click', (_, d: any) => {
          this.filterEventService.dataFilter$.emit({
            course: d.model_name,
          });
        })
        .attr(
          'y',
          (d) =>
            this.yScale(
              (field == 'field1' ? d.field1 : d.field2) as number
            ) as number
        )
        .attr('width', this.xScale1.bandwidth())
        .attr('height', (d) => {
          let value = field == 'field1' ? d.field1 : d.field2;
          return (
            this.height -
            this.margin.top -
            this.margin.bottom -
            this.yScale(value)
          );
        });
    }
  }
  private insertAxesLabel() {
    this.svg!.append('g')
      .attr('class', 'x axis')
      .attr(
        'transform',
        `translate(0,${this.height - this.margin.top - this.margin.bottom})`
      )
      .call(this.xAxis)
      .selectAll('text')
      .attr('dy', '.35em')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end') // Add the Y Axis
      .style('font-size', 'medium')
      .each(function (d) {
        let el = d3.select(this);
        let txt = d3.select(this).text();
        let words = txt.split(' ');
        el.text('');
        for (let i = 0; i < words.length; i++) {
          let tspan = el.append('tspan').text(words[i]);
          if (i > 0) tspan.attr('x', 15).attr('dy', '15');
        }
      });

    this.svg!.append('g')
      .attr('class', 'y axis')
      .call(this.yAxis)
      .selectAll('text')
      .style('font-size', 'medium');

    this.svg!.append('text')
      .attr('text-anchor', 'middle')
      .attr(
        'transform',
        'translate(' +
          -this.margin.left / 2 +
          ',' +
          this.height / 2.55 +
          ')rotate(-90)'
      )
      .text('Pourcentage (%)')
      .style('font-size', 'large');

    this.svg!.append('text')
      .attr('text-anchor', 'middle')
      .attr(
        'transform',
        `translate(${this.width / 2 - this.margin.left}, ${
          this.height - this.margin.bottom / 2.75
        })`
      )
      .text('Matière')
      .style('font-size', 'large');
  }

  private insertLegend() {
    let options = ['Commentaire positif', 'Moyenne générale'];
    let colors = [
      this.theme.currentTheme!.accent,
      this.theme.currentTheme!.primary,
    ];
    let legend = this.svg!.selectAll('.legend')
      .data(options.slice())
      .enter()
      .append('g')
      .attr('class', 'legend')
      .attr('transform', function (d, i) {
        return 'translate(' + (-300 - 175 * i) + ',' + -25 + ')';
      });

    legend
      .append('rect')
      .attr('x', this.width + 18)
      .attr('width', 18)
      .attr('height', 18)
      .style('fill', function (d, i) {
        return colors[i];
      });

    legend
      .append('text')
      .attr('x', this.width + 40)
      .attr('y', 9)
      .attr('dy', '.35em')
      .style('text-anchor', 'start')
      .style('font-size', 'medium')
      .text(function (d) {
        return d;
      });
  }

  private drawViz(): void {
    this.defineChartProperties();
    this.addBarsToSVG();
    this.insertAxesLabel();
    this.insertLegend();
  }

  private preprocessData(data: RawDataEntry[]) {
    let courses = new Set<string>();
    let test = new Set();
    let bars = [];
    for (const row of data) {
      courses.add(row.course);
    }

    for (const course of courses) {
      let totalCount: number = 0;
      let positiveCount: number = 0;
      let cumulativeGrades: number = 0;
      let countPositiveGreat: number = 0;
      for (const row of data) {
        if (row.course == course) {
          totalCount += 1;
          test.add(row.sentiment);
          if (row.mark > 0 && !isNaN(row.mark)) {
            countPositiveGreat += 1;
            cumulativeGrades += row.mark;
          }
          if (row.sentiment === 'Positif') positiveCount += 1;
        }
      }
      const positiveRatio = (positiveCount / totalCount) * 100;
      const averagePerCourse = cumulativeGrades / countPositiveGreat;
      bars.push({
        model_name: course,
        field1: averagePerCourse,
        field2: positiveRatio,
      });
    }
    return bars;
  }
}

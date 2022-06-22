import * as d3 from 'd3';
import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import {
  MinMax,
  ViewStudentData,
} from 'src/app/interfaces/general-view.interface';
import { FilterEventsService } from 'src/app/services/filter-events.service';
import { RawDataEntry } from 'src/app/interfaces/data-entry.interface';
import { ThemeService } from 'src/app/services/theme.service';

// This visualisation is based on : https://codepen.io/borntofrappe/pen/QXNvjx

@Component({
  selector: 'app-general-view',
  templateUrl: './general-view.component.html',
  styleUrls: ['./general-view.component.scss'],
})
export class GeneralViewComponent implements OnChanges, AfterViewInit {
  @Input() data: RawDataEntry[] = [];
  @ViewChild('quadrantChartSvg')
  private quadrantChartSvg: ElementRef<HTMLElement> | undefined;

  private svg: d3.Selection<HTMLElement, unknown, null, undefined> | undefined;
  private sentimentAxis: d3.Axis<d3.NumberValue> | undefined;
  private averageAxis: d3.Axis<d3.NumberValue> | undefined;
  private dataProcessed: ViewStudentData[] = [];
  private levels: string[] = [];
  private colorScale: d3.ScaleLinear<number, number, never> | undefined;

  private group:
    | d3.Selection<SVGGElement, unknown, null, undefined>
    | undefined;

  private quadrantsGroup:
    | d3.Selection<SVGGElement, unknown, null, undefined>
    | undefined;

  private quadrants:
    | d3.Selection<SVGGElement, string, SVGGElement, unknown>
    | undefined;

  private width = 0;
  private height = 0;
  private margin = {
    top: 5,
    right: 100,
    bottom: 75,
    left: 100,
  };

  private averages: MinMax = {
    min: 0,
    max: 100,
  };
  private sentiments: MinMax = {
    min: 0,
    max: 100,
  };

  private readonly quadLabels = [
    '(+) Réussite (-) Comportement',
    '(+) Réussite (+) Comportement',
    '(-) Réussite (-) Comportement',
    '(-) Réussite (+) Comportement',
  ];

  private quadColors = ['#ffe7dd80', '#bfdfbf80', '#ffbfbf80', '#ffe7dd80'];

  private sentimentScale: d3.ScaleLinear<number, number, never> | undefined;
  private averageScale: d3.ScaleLinear<number, number, never> | undefined;

  private highlightStudent: boolean | undefined;

  constructor(
    // eslint-disable-next-line no-unused-vars
    private readonly host: ElementRef,
    // eslint-disable-next-line no-unused-vars
    private readonly theme: ThemeService,
    // eslint-disable-next-line no-unused-vars
    private readonly filter: FilterEventsService
  ) {}

  ngAfterViewInit(): void {
    this.vizPipeline();
    const observer = new ResizeObserver(() => {
      this.vizPipeline();
    });
    observer.observe(this.host.nativeElement);
    this.theme.themeChange$.subscribe(() => {
      this.vizPipeline();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.data && !changes.data.firstChange) {
      this.vizPipeline();
    }
  }

  private vizPipeline() {
    if (this.group) this.group!.remove();
    this.setupSvg();
    this.setupScales();
    this.updateData(this.data);
    this.setUpGroup();
    this.setUpQuadrantsGroups();
    this.setUpQuadrants();
    this.setupAxis();
    this.setupLegend();
    this.addDatas();
  }

  private setupScales() {
    this.sentimentScale = d3
      .scaleLinear()
      .domain([this.sentiments.min, this.sentiments.max])
      .range([0, this.width]);
    this.averageScale = d3
      .scaleLinear()
      .domain([this.averages.min, this.averages.max])
      .range([this.height, 0]);
  }

  private updateData(data: RawDataEntry[]) {
    this.preprocessData(data);
    this.highlightStudent = this.dataProcessed.length === 1;
  }

  private preprocessData(data: RawDataEntry[]): any {
    this.levels = Array.from(new Set(data.map((r) => r.level))).sort();
    this.colorScale = d3
      .scaleLinear()
      .domain([0, this.levels.length - 1])
      .range([
        this.theme.currentTheme!.primary as any,
        this.theme.currentTheme!.accent as any,
      ]);

    // const students = new Map<
    //   string,
    //   {
    //     marks: { [course: string]: number };
    //     comments: { [course: string]: number };
    //   }
    // >();
    // for (const row of data) {
    //   if (isNaN(row.mark)) {
    //     continue;
    //   }
    //   if (students.has(row.permanentCode)) {
    //     students.get(row.permanentCode)![row.course] = row.mark;
    //   } else {
    //     students.set(row.permanentCode, { [row.course]: row.mark });
    //   }
    // }
    // this.nStudents = students.size;
    // if (students.size === 0) {
    //   this.overallAverage = 0;
    //   return;
    // }
    // let sum = 0;
    // students.forEach((marks) => {
    //   let studentSum = 0;
    //   for (const course in marks) {
    //     studentSum += marks[course];
    //   }
    //   sum += studentSum / Object.keys(marks).length;
    // });
    // this.overallAverage = sum / students.size;

    const studentMap: Map<String, ViewStudentData> = new Map();
    for (const row of data) {
      const key = row.studentName;
      if (!studentMap.has(key)) {
        const tab: ViewStudentData = {
          name: key,
          overallMark: row.overallAverage,
          overallSentiment: row.overallStudentPosSentPercAvg,
          color: this.colorScale(
            this.levels.findIndex((l) => l === row.level)
          ) as any,
          permanentCode: row.permanentCode,
        };
        studentMap.set(key, tab);
      }
    }
    this.dataProcessed = Array.from(studentMap.values());
  }

  private setupSvg(): void {
    const svgElement = this.quadrantChartSvg!.nativeElement;
    const rect = svgElement.getBoundingClientRect();
    this.width = rect.width - (this.margin.left + this.margin.right);
    this.height = rect.height - (this.margin.top + this.margin.bottom);

    d3.select(svgElement).attr('viewBox', `0 0 ${rect.width} ${rect.height}`);

    this.svg = d3.select(svgElement);
  }

  private setUpGroup() {
    this.group = this.svg!.append('g').attr(
      'transform',
      `translate(${this.margin.left} ${this.margin.top})`
    );
  }

  private setUpQuadrantsGroups() {
    this.group!.append('g').attr('class', 'quadrants');
    this.quadrantsGroup = this.group!.select('g');
  }

  private setUpQuadrants() {
    this.quadrants = this.quadrantsGroup!.selectAll('g.quadrant')
      .data(this.quadLabels)
      .enter()
      .append('g')
      .attr('class', 'quadrant')
      .attr(
        'transform',
        (_, i) =>
          `translate(${i % 2 === 0 ? 0 : this.width / 2} ${
            i < 2 ? 0 : this.height / 2
          })`
      );

    this.quadrants!.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', this.width / 2)
      .attr('height', this.height / 2)
      .attr('fill', (_, i) => this.quadColors[i]);

    this.quadrants!.append('text')
      .attr('x', this.width / 4)
      .attr('y', (_, i) => (i < 2 ? 15 : this.height / 2 - 15))
      .attr('class', 'currentColor')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .text((d) => d)
      .style('text-transform', 'uppercase')
      .style('font-weight', 'lighter')
      .style('font-size', 'small')
      .attr('opacity', 0.9);
  }

  private setupAxis() {
    this.sentimentAxis = d3
      .axisBottom(this.sentimentScale!)
      .tickFormat((d) => `${d.toString()}%`);

    this.averageAxis = d3
      .axisLeft(this.averageScale!)
      .tickFormat((d) => `${d}%`);

    this.group!.append('g')
      .attr('transform', `translate(0 ${this.height})`)
      .attr('class', 'axis axis-sentiment')
      .call(this.sentimentAxis)
      .selectAll('text')
      .style('font-size', 'small');

    this.group!.append('g')
      .attr('class', 'axis axis-average')
      .call(this.averageAxis)
      .selectAll('text')
      .style('font-size', 'small');

    // remove the path describing the axes
    d3.selectAll('.axis').select('path').remove();

    d3.select('.axis-sentiment').selectAll('line').attr('y2', 5);

    d3.select('.axis-average').selectAll('line').attr('x2', -4);

    d3.selectAll('.axis').selectAll('text').attr('font-size', '0.55rem');

    // grid
    // include dotted lines for each tick and for both axes
    d3.select('.axis-sentiment')
      .selectAll('g.tick')
      .append('path')
      .attr('d', `M 0 0 v -${this.height}`)
      .attr('stroke', 'currentColor')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '2')
      .attr('opacity', 0.1);

    d3.select('.axis-average')
      .selectAll('g.tick')
      .append('path')
      .attr('d', `M 0 0 h ${this.width}`)
      .attr('stroke', 'currentColor')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '2')
      .attr('opacity', 0.1);

    d3.select('.axis-sentiment')
      .append('g')
      .attr('class', 'label label-sentiment')
      .attr(
        'transform',
        `translate(${this.width / 2} ${this.margin.bottom - 10})`
      );

    d3.select('g.label-sentiment')
      .append('text')
      .attr('x', 0)
      .attr('y', -this.margin.bottom / 4)
      .text('Pourcentage d´enjeux de commentaires positifs')
      .style('font-size', 'medium')
      .attr('text-anchor', 'middle');

    d3.select('.axis-average')
      .append('g')
      .attr('class', 'label label-average')
      .attr(
        'transform',
        `translate(-${this.margin.left - 10} ${this.height / 2})`
      );

    d3.select('g.label-average')
      .append('text')
      .attr('x', 0)
      .attr('y', this.margin.left / 4)
      .text('Moyenne générale')
      .style('font-size', 'medium')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'hanging')
      .attr('transform', 'rotate(-90)');
  }

  private setupLegend(): void {
    const legend = this.levels.map((level) => ({
      name: level,
      color: this.colorScale!(this.levels.findIndex((l) => l === level)) as any,
    }));

    const legendHeight = this.levels.length * 25 - 15;

    const legendGroup = this.group!.append('g')
      .attr('class', 'legend')
      .attr(
        'transform',
        `translate(${
          this.margin.left + this.width - 0.75 * this.margin.right
        }, ${this.margin.top / 2 + this.height / 2 - legendHeight / 2})`
      );

    const legendItems = legendGroup
      .selectAll('g.legend-item')
      .data(legend)
      .enter()
      .append('g')
      .attr('class', 'legend-item')
      .attr('transform', (_, i) => `translate(0, ${i * 25})`);

    legendItems
      .append('circle')
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', 10)
      .attr('fill', (({ color }: ViewStudentData) => color) as any);

    legendItems
      .append('text')
      .attr('x', 15)
      .attr('y', 2)
      .attr('dominant-baseline', 'middle')
      .text((d) => d.name)
      .style('letter-spacing', '0.05rem');
  }

  private getDataPointsGroups(
    group: any,
    data: ViewStudentData[]
  ): d3.Selection<SVGGElement, ViewStudentData, SVGGElement, unknown> {
    return group
      .selectAll('g.data-point')
      .data(data)
      .enter()
      .append('g')
      .attr('class', 'data-point')
      .attr(
        'transform',
        (d: any) =>
          `translate(${this.sentimentScale!(d.overallSentiment!)} ${this
            .averageScale!(d.overallMark!)})`
      );
  }

  private addDatas() {
    const dataGroup = this.group!.append('g').attr('class', 'data');
    const tooltipDataGroup = this.group!.append('g').attr(
      'class',
      'tooltip-data'
    );

    const dataPointsGroup = this.getDataPointsGroups(
      dataGroup,
      this.dataProcessed
    );

    const tooltipDataPointsGroup = this.getDataPointsGroups(
      tooltipDataGroup,
      this.dataProcessed
    );

    // circles using the defined color
    dataPointsGroup
      .append('circle')
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', 5)
      .attr('fill', ({ color }: ViewStudentData) => color);

    // labels describing the circle elements
    tooltipDataPointsGroup
      .append('text')
      .attr('x', 8)
      .attr('y', 0)
      .attr('class', 'name')
      .text(
        ({ name, permanentCode }: ViewStudentData) =>
          `${name} (${permanentCode})`
      )
      .attr('dominant-baseline', 'central')
      .style('font-size', '0.55rem')
      .style('letter-spacing', '0.05rem')
      .style('display', this.highlightStudent ? 'block' : 'none')
      .style('pointer-events', 'none')
      .attr('transform', (d: any) =>
        d.overallSentiment > this.sentiments.max * 0.75 && this.highlightStudent
          ? `translate(${-400}, 0)`
          : ''
      );

    dataPointsGroup
      .style('cursor', 'pointer')
      .on('click', (_, row: ViewStudentData) => {
        this.filter.dataFilter$.emit({
          studentName: `${row.name} (${row.permanentCode})`,
        });
      });

    if (this.highlightStudent) {
      const index = 0;
      const g = tooltipDataPointsGroup
        .node()!
        .parentElement!.childNodes.item(index);
      this.onMouseEnter(g as SVGGElement);
      return;
    }

    const context = this;
    dataPointsGroup
      .on('mouseenter', function () {
        const index = Array.from(this.parentElement!.children).findIndex(
          (e) => e === this
        );
        const g = tooltipDataPointsGroup
          .node()!
          .parentElement!.childNodes.item(index);
        context.onMouseEnter(g as SVGGElement);
      })
      .on('mouseout', function () {
        const index = Array.from(this.parentElement!.children).findIndex(
          (e) => e === this
        );
        const g = tooltipDataPointsGroup
          .node()!
          .parentElement!.childNodes.item(index);
        context.deleteTooltip(g);
      });
  }

  private onMouseEnter(tooltipGroup: SVGGElement): void {
    const text = this.studentInfosTip(tooltipGroup);
    const tooltip = d3
      .select(tooltipGroup)
      .insert('g', ':first-child')
      .attr('class', 'tooltip')
      .attr('opacity', 0)
      .style('pointer-events', 'none');

    const textElement = (text as any)['_groups'][0][0];
    const {
      x,
      y,
      width: textWidth,
      height: textHeight,
    } = textElement.getBBox();

    tooltip
      .append('rect')
      .attr('x', x - 3)
      .attr('y', y - 1.5)
      .attr('width', textWidth + 6)
      .attr('height', textHeight + 3)
      .attr('fill', 'hsl(227, 9%, 81%)')
      .attr('rx', '2')
      .transition()
      // .attr('transform', 'translate(12 0)')
      .attr('transform', (d: any) =>
        d.overallSentiment > this.sentiments.max * 0.75 && this.highlightStudent
          ? `translate(${-400 + 12}, 0)`
          : 'translate(12 0)'
      );

    this.addDashLines(tooltip);
    this.labelsInfosTip(tooltip);
    this.tooltipCircle(tooltip);
  }

  private studentInfosTip(tooltipGroup: any) {
    const text = d3
      .select(tooltipGroup as any)
      .select('text.name')
      .style('display', 'block')
      .style('font-size', 'larger');

    text
      .transition()
      // .attr('transform', 'translate(12 0)')
      .attr('transform', (d: any) =>
        d.overallSentiment > this.sentiments.max * 0.75 && this.highlightStudent
          ? `translate(${-400 + 12}, 0)`
          : 'translate(12, 0)'
      )
      .style('color', 'hsl(230, 29%, 19%)')
      .style('text-shadow', 'none');

    return text;
  }

  private addDashLines(toolTip: any) {
    const dashedLines = toolTip
      .append('g')
      .attr('fill', 'none')
      .attr('stroke', 'hsl(227, 9%, 81%)')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '7 4')
      .style('animation', 'dashOffset 1.5s linear infinite');

    dashedLines
      .append('path')
      .attr(
        'd',
        (d: any) => `M 0 0 v ${this.averageScale!(100 - d.overallMark)}`
      );

    dashedLines
      .append('path')
      .attr(
        'd',
        (d: any) => `M 0 0 h -${this.sentimentScale!(d.overallSentiment)}`
      );
  }

  private labelsInfosTip(toolTip: any) {
    const labels = toolTip
      .append('g')
      .attr('font-size', 'medium')
      .attr('fill', 'hsl(227, 9%, 81%)');

    const labelSentiment = labels
      .append('g')
      .attr(
        'transform',
        (d: any) =>
          `translate(0 ${this.averageScale!(
            this.averages.max - d.overallMark
          )})`
      );

    const textSentiment = labelSentiment
      .append('text')
      .attr('x', 0)
      .attr('y', 0)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .style('color', 'hsl(230, 29%, 19%)')
      .text((d: any) => `${d.overallSentiment.toFixed(2)} %`);

    const labelAverage = labels
      .append('g')
      .attr(
        'transform',
        (d: any) => `translate(-${this.sentimentScale!(d.overallSentiment)} 0)`
      );

    const textAverage = labelAverage
      .append('text')
      .attr('x', 0)
      .attr('y', 0)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .style('color', 'hsl(230, 29%, 19%)')
      .text((d: any) => `${d.overallMark.toFixed(2)} %`);

    const { width: sentimentWidth, height: sentimentHeight } = (
      textSentiment as any
    )['_groups'][0][0].getBBox();

    const { width: averageWidth, height: averageHeight } = (textAverage as any)[
      '_groups'
    ][0][0].getBBox();

    labelSentiment
      .insert('rect', ':first-child')
      .attr('x', -sentimentWidth / 2 - 4)
      .attr('y', -sentimentHeight / 2 - 2)
      .attr('width', sentimentWidth + 8)
      .attr('height', sentimentHeight + 4)
      .attr('rx', 3);

    labelAverage
      .insert('rect', ':first-child')
      .attr('x', -averageWidth / 2 - 4)
      .attr('y', -averageHeight / 2 - 2)
      .attr('width', averageWidth + 8)
      .attr('height', averageHeight + 4)
      .attr('rx', 3);
  }

  private tooltipCircle(toolTip: any) {
    toolTip
      .append('circle')
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('fill', 'none')
      .attr('stroke', 'hsl(227, 9%, 81%)')
      .attr('stroke-width', 2)
      .attr('r', 0)
      .transition()
      .attr('r', 9.5);

    toolTip.transition().attr('opacity', 1);
  }

  private deleteTooltip(tooltipGroup: any) {
    d3.select(tooltipGroup)
      .select('text.name')
      .transition()
      .delay(50)
      .attr('transform', 'translate(0 0)')
      .style('color', 'inherit')
      .style('text-shadow', 'inherit')
      .style('display', 'none');

    d3.select(tooltipGroup)
      .select('g.tooltip')
      .transition()
      .attr('opacity', 0)
      .remove();
  }
}

import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { FilterEventsService } from '../services/filter-events.service';
import { RawDataEntry } from '../interfaces/data-entry.interface';
import { ThemeService } from '../services/theme.service';

import * as d3 from 'd3';

// eslint-disable-next-line no-unused-vars
enum Sentiment {
  // eslint-disable-next-line no-unused-vars
  positive = 'Positif',
  // eslint-disable-next-line no-unused-vars
  negative = 'Négatif',
}

interface SentimentResults {
  positivePercentage: number;
  positiveCount: number;
  negativePercentage: number;
  negativeCount: number;
}

@Component({
  selector: 'app-comments-summary-view',
  templateUrl: './comments-summary-view.component.html',
  styleUrls: ['./comments-summary-view.component.scss'],
})
export class CommentsSummaryViewComponent implements OnChanges, AfterViewInit {
  @Input() data: RawDataEntry[] = [];

  @ViewChild('commentsDonutSvg')
  private commentsDonutSvg: ElementRef<HTMLElement> | undefined;
  @ViewChild('toolTip')
  private toolTip: ElementRef<HTMLElement> | undefined;

  private svg: d3.Selection<HTMLElement, unknown, null, undefined> | undefined;

  private dataReady: any = [];
  private width: number = 0;
  private height: number = 0;

  constructor(
    // eslint-disable-next-line no-unused-vars
    private readonly host: ElementRef,
    // eslint-disable-next-line no-unused-vars
    private readonly theme: ThemeService,
    // eslint-disable-next-line no-unused-vars
    private readonly filter: FilterEventsService
  ) {}

  ngAfterViewInit(): void {
    this.viz();
    new ResizeObserver(() => {
      this.viz();
    }).observe(this.host.nativeElement);
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
    if (this.svg) {
      this.svg.remove();
    }
    this.toolTip!.nativeElement.style.display = 'none';
    this.setupSvg();
    this.updateData(this.data);
    this.drawViz();
  }

  private updateData(data: RawDataEntry[]): void {
    const d: SentimentResults = this.preprocessData(data);
    const pie = d3
      .pie()
      .sort(null) // Do not sort group by size
      .value((d: any) => {
        return d.value;
      });
    const temp: any = [
      {
        name: Sentiment.positive,
        value: d.positivePercentage,
        count: d.positiveCount,
        color: this.theme.currentTheme!.primary,
      },
      {
        name: Sentiment.negative,
        value: d.negativePercentage,
        count: d.negativeCount,
        color: this.theme.currentTheme!.accent,
      },
    ];
    this.dataReady = pie(temp);
  }

  private setupSvg(): void {
    const svgElement = this.commentsDonutSvg!.nativeElement;

    const rect = svgElement.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height;

    d3.select(svgElement)
      .append('g')
      .attr('transform', `translate(${this.width / 2}, ${this.height / 2})`);

    this.svg = d3.select(svgElement).select('g');
  }

  private drawViz(): void {
    const radius = Math.min(this.width, this.height - 40) / 2;

    const arc = d3
      .arc()
      .innerRadius(radius * 0.3) // This is the size of the donut hole
      .outerRadius(radius * 0.8);

    const t = d3.select(this.toolTip!.nativeElement);

    this.svg!.selectAll('path')
      .data(this.dataReady)
      .join('path')
      .attr('d', arc as any)
      .attr('fill', (d: any) => d.data.color)
      .attr('stroke', 'white')
      .style('stroke-width', '2px')
      .style('stroke-opacity', '0.25')
      .attr('transform', `translate(0, -${30})`)
      .on('mousemove', function (event) {
        const data: any = d3.select(this).datum();
        d3.select(this).style('opacity', 0.8);
        t.select('.name').html(data.data.name);
        t.select('.count').html(`Occurrences: ${data.data.count}`);
        t.select('.percentage').html(`Pourcentage: ${data.data.value} %`);
        t.style('display', 'block');
        t.style('left', event.clientX + 5 + 'px');
        t.style('top', event.clientY + 5 + 'px');
      })
      .on('mouseout', function () {
        d3.select(this).style('opacity', 1);
        t.style('display', 'none');
      })
      .attr('cursor', 'pointer')
      .on('click', (_, d: any) => {
        this.filter.dataFilter$.emit({
          sentiment: d.data.name,
        });
      });

    const legend = this.svg!.append('g').attr('class', 'legend');

    const lg = legend
      .selectAll('g')
      .data(this.dataReady)
      .enter()
      .append('g')
      .attr('transform', (d, i) => `translate(${i * 100},${this.height + 15})`);

    lg.append('rect')
      .style('fill', (d: any) => d.data.color)
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', 15)
      .attr('height', 15);

    lg.append('text')
      .attr('x', 20)
      .attr('y', 12)
      .text((d: any) => d.data.name);

    const nodeWidth = (d: any) => d.getBBox().width;

    let offset = 0;

    lg.attr('transform', function () {
      let x = offset;
      offset += nodeWidth(this) + 10;
      return `translate(${x},${radius - 20})`;
    });

    legend.attr('transform', function () {
      return `translate(${(0 - nodeWidth(this)) / 2},${0})`;
    });
  }

  private preprocessData(data: RawDataEntry[]): SentimentResults {
    let totalCount: number = 0;
    let positiveCount: number = 0;

    for (const row of data) {
      if (row.sentiment == Sentiment.positive) {
        positiveCount += 1;
      }
      totalCount += 1;
    }

    const positiveRatio = Math.floor((positiveCount / totalCount) * 100);
    const negativeRatio = 100 - positiveRatio;

    return {
      positivePercentage: positiveRatio,
      positiveCount: positiveCount,
      negativePercentage: negativeRatio,
      negativeCount: totalCount - positiveCount,
    };
  }
}

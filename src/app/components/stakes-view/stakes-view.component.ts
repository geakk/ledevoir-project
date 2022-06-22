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
import { RawDataEntry } from 'src/app/interfaces/data-entry.interface';
import { ThemeService } from 'src/app/services/theme.service';

import * as d3 from 'd3';

interface Margin {
  left: number;
  right: number;
  bottom: number;
  top: number;
}

// eslint-disable-next-line no-unused-vars
enum Sentiment {
  // eslint-disable-next-line no-unused-vars
  positive = 'Positif',
  // eslint-disable-next-line no-unused-vars
  negative = 'Négatif',
}

@Component({
  selector: 'app-stakes-view',
  templateUrl: './stakes-view.component.html',
  styleUrls: ['./stakes-view.component.scss'],
})
export class StakesViewComponent implements OnChanges, AfterViewInit {
  @Input() data: RawDataEntry[] = [];
  @ViewChild('stakeSvg')
  private stakeSvg: ElementRef<HTMLElement> | undefined;
  @ViewChild('toolTip')
  private toolTip: ElementRef<HTMLElement> | undefined;
  private svg: d3.Selection<HTMLElement, unknown, null, undefined> | undefined;

  private margins: Margin = { top: 0, right: 0, bottom: 0, left: 0 };
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

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.data && !changes.data.firstChange) {
      this.updateViz();
    }
  }

  ngAfterViewInit(): void {
    this.updateViz();
    const observer = new ResizeObserver(() => {
      this.updateViz();
    });
    observer.observe(this.host.nativeElement);
    this.theme.themeChange$.subscribe(() => this.updateViz());
  }

  updateViz() {
    const processedData: any[] = this.preprocessData(this.data);
    if (this.svg) {
      this.svg.remove();
    }
    if (this.toolTip) {
      this.toolTip.nativeElement!.style.display = 'none';
    }
    this.setUpSvg();
    this.drawViz(processedData);
  }

  setUpSvg(): void {
    const svgElement = this.stakeSvg!.nativeElement;
    const rect = svgElement.getBoundingClientRect();
    this.margins = {
      top: 50,
      right: 50,
      bottom: 100,
      left: Math.min(Math.max(0.3 * rect.width, 350), 450),
    };
    this.width = rect.width - this.margins.left - this.margins.right;
    this.height = rect.height - this.margins.top - this.margins.bottom;

    d3.select(svgElement)
      .append('g')
      .attr(
        'transform',
        `translate(${this.margins.left}, ${this.margins.top})`
      );
    this.svg = d3.select(svgElement).select('g');
  }

  drawViz(dataset: any[]): void {
    const stakes = dataset[0].map(function (d: any) {
      return d.y;
    });

    const yScale = d3
      .scaleBand()
      .domain(stakes)
      .rangeRound([0, this.height])
      .padding(0.1);

    const yAxis = d3.axisLeft(yScale);

    const xMax = d3.max(dataset, function (count: any) {
      const maxCount = d3.max(count, function (d) {
        return (d as any).x + (d as any).x0;
      });
      return maxCount;
    });

    const xScale = d3
      .scaleLinear()
      .domain([0, xMax as any])
      .range([0, this.width]);

    const xAxis = d3.axisBottom(xScale);

    const colors = (i: any) => {
      return i
        ? this.theme.currentTheme!.accent
        : this.theme.currentTheme!.primary;
    };

    let tooltip = d3.select(this.toolTip!.nativeElement);

    const graph = this.svg!.selectAll('g')
      .data(dataset)
      .enter()
      .append('g')
      .style('fill', function (_, i) {
        return colors(i);
      });

    graph
      .selectAll('rect')
      .data(function (d) {
        return d as any;
      })
      .enter()
      .append('rect')
      .attr('x', function (d) {
        return xScale((d as any).x0);
      })
      .attr('y', function (d) {
        return yScale((d as any).y) as any;
      })
      .attr('height', function () {
        return yScale.bandwidth();
      })
      .attr('width', function (d) {
        return xScale((d as any).x);
      })
      .on('mouseenter', function () {
        d3.select(this).attr('opacity', 0.5);
      })
      .on('mousemove', function (event, d: any) {
        tooltip
          .html(d.x)
          .style('left', event.clientX + 5 + 'px')
          .style('top', event.clientY + 5 + 'px')
          .style('display', 'block');
        d3.select(this).style('opacity', 0.5);
      })
      .on('mouseleave', function () {
        d3.select(this).style('opacity', 1);
        tooltip.html('').style('display', 'none');
      })
      .style('cursor', 'pointer')
      .on('click', (_, d: any) => {
        this.filter.dataFilter$.emit({
          stake: d.y,
          sentiment: d.x0 === 0 ? 'Positif' : 'Négatif',
        });
      });

    this.svg!.append('g')
      .attr('class', 'bc-x-axis bc-axis')
      .attr('transform', 'translate(0,' + this.height + ')')
      .call(xAxis)
      .selectAll('text')
      .style('font-size', 'medium');

    this.svg!.append('g')
      .attr('class', 'bc-y-axis bc-axis')
      .call(yAxis)
      .selectAll('text')
      .style('font-size', 'medium');

    this.svg!.append('text')
      .attr('text-anchor', 'middle')
      .attr(
        'transform',
        `translate(${-this.margins.left + 75}, ${
          this.margins.top / 2 + this.height / 2
        }) rotate(-90)`
      )
      .text('Les enjeux')
      .style('font-size', 'medium');

    this.svg!.append('text')
      .attr('text-anchor', 'middle')
      .attr(
        'transform',
        `translate(${this.width / 4 + this.margins.left / 2}, ${
          this.margins.top + this.height + this.margins.bottom / 6
        })`
      )
      .text('Nombre de commentaires')
      .style('font-size', 'medium');

    let options = ['Positif', 'Négatif'];

    let legend = this.svg!.selectAll('.legend')
      .data(options)
      .enter()
      .append('g')
      .attr('class', 'legend')
      .attr('transform', (_, i) => {
        return `translate(${(-2 * this.width) / 5 + 75 * i}, -25)`;
      });

    legend
      .append('rect')
      .attr('x', this.width + 18)
      .attr('width', 18)
      .attr('height', 18)
      .style('fill', function (d, i) {
        return colors(i);
      });

    legend
      .append('text')
      .attr('x', this.width + 40)
      .attr('y', 9)
      .attr('dy', '.35em')
      .style('text-anchor', 'start')
      .text(function (d) {
        return d;
      });
  }

  preprocessData(data: RawDataEntry[]): any[] {
    let stakes: any = {};

    data.forEach((elem) => {
      let stake: any = elem.stake;

      if (!(stake in stakes)) {
        stakes[stake] = { Total: 0, Positif: 0, Négatif: 0 };
      } else {
        stakes[stake].Total += 1;
        if (elem.sentiment == Sentiment.positive) {
          stakes[stake][Sentiment.positive] += 1;
        } else {
          stakes[stake][Sentiment.negative] += 1;
        }
      }
    });

    let sortedData: any = this.sortDataByTotal(stakes);

    const positives: any = [];
    const negatives: any = [];

    sortedData.forEach((elem: any) => {
      positives.push({ x: elem[1].Positif, y: elem[0], x0: 0 });
      negatives.push({
        x: elem[1].Négatif,
        y: elem[0],
        x0: elem[1].Positif,
      });
    });

    return [positives, negatives];
  }

  sortDataByTotal(data: any): any[] {
    return Object.entries(data).sort((a: any, b: any) => {
      return b[1].Total - a[1].Total;
    });
  }
}

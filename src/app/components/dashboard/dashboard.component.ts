import {
  AfterViewChecked,
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';

import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';

import { FilterEventsService } from 'src/app/services/filter-events.service';
import { RawDataEntry } from 'src/app/interfaces/data-entry.interface';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent
  implements OnInit, AfterViewInit, OnChanges, AfterViewChecked
{
  @Input() data: RawDataEntry[] = [];
  tableDataSource: RawDataEntry[] = [];

  @ViewChild(MatPaginator) paginator: MatPaginator | undefined;
  @ViewChild(MatSort) sort: MatSort | undefined;

  nStudents: number = 0;
  overallAverage: number = 0;
  resultsLength: number = 0;
  totalCount: number = 0;

  constructor(
    // eslint-disable-next-line no-unused-vars
    private readonly cdr: ChangeDetectorRef,
    // eslint-disable-next-line no-unused-vars
    private readonly filter: FilterEventsService
  ) {}

  ngAfterViewChecked(): void {
    this.cdr.detectChanges();
  }

  ngOnInit(): void {
    this.setNStudentsAndAverage(this.data);
    this.totalCount = this.data.length;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.data && !changes.data.firstChange) {
      this.onDataChange(changes.data.currentValue);
    }
  }

  ngAfterViewInit(): void {
    this.sort!.sortChange.subscribe((sort) => this.onSortChange(sort));
    this.paginator!.page.subscribe((pageEvent) =>
      this.onPaginatorPageChange(pageEvent)
    );
    this.onPaginatorPageChange({
      pageIndex: 0,
      pageSize: this.paginator?.pageSize as number,
      length: this.totalCount,
    });
  }

  private onSortChange(sort: Sort): void {
    this.paginator!.firstPage();
    const sortDesc = sort.direction === 'desc';
    const sortKey = sort.active as keyof RawDataEntry;
    this.data = this.data.sort((a: RawDataEntry, b: RawDataEntry) =>
      sortDesc
        ? b[sortKey].toString().localeCompare(a[sortKey].toString())
        : a[sortKey].toString().localeCompare(b[sortKey].toString())
    );

    this.tableDataSource = this.data.slice(
      this.paginator!.pageIndex * this.paginator!.pageSize,
      (this.paginator!.pageIndex + 1) * this.paginator!.pageSize
    );
  }

  private onPaginatorPageChange(pageEvent: PageEvent): void {
    this.tableDataSource = this.data.slice(
      pageEvent.pageIndex * pageEvent.pageSize,
      (pageEvent.pageIndex + 1) * pageEvent.pageSize
    );
  }

  private onDataChange(data: RawDataEntry[]): void {
    this.setNStudentsAndAverage(data);
    this.totalCount = this.data.length;
    this.onPaginatorPageChange({
      pageIndex: 0,
      pageSize: this.paginator?.pageSize as number,
      length: this.totalCount,
    });
    this.paginator!.firstPage();
  }

  private setNStudentsAndAverage(data: RawDataEntry[]): void {
    const students = new Map<string, { [course: string]: number }>();
    for (const row of data) {
      if (isNaN(row.mark)) {
        continue;
      }
      if (students.has(row.permanentCode)) {
        students.get(row.permanentCode)![row.course] = row.mark;
      } else {
        students.set(row.permanentCode, { [row.course]: row.mark });
      }
    }
    this.nStudents = students.size;
    if (students.size === 0) {
      this.overallAverage = 0;
      return;
    }
    let sum = 0;
    students.forEach((marks) => {
      let studentSum = 0;
      for (const course in marks) {
        studentSum += marks[course];
      }
      sum += studentSum / Object.keys(marks).length;
    });
    this.overallAverage = sum / students.size;
  }

  onClick(row: RawDataEntry): void {
    this.filter.dataFilter$.emit({
      studentName: `${row.studentName} (${row.permanentCode})`,
    });
  }
}

import {
  PERFECT_SCROLLBAR_CONFIG,
  PerfectScrollbarConfigInterface,
  PerfectScrollbarModule,
} from 'ngx-perfect-scrollbar';
import { AppComponent } from './pages/app/app.component';
import { AppMaterialModule } from './modules/material.module';
import { AppRoutingModule } from './modules/app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { CommentsSummaryViewComponent } from './comments-summary-view/comments-summary-view.component';
import { CourseComparisonViewComponent } from './components/course-comparison-view/course-comparison-view.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { FormsModule } from '@angular/forms';
import { GeneralViewComponent } from './components/general-view/general-view.component';
import { HttpClientModule } from '@angular/common/http';
import { LevelComparisonViewComponent } from './components/level-comparison-view/level-comparison-view.component';
import { NgModule } from '@angular/core';
import { StakesViewComponent } from './components/stakes-view/stakes-view.component';
import { LineChartComponent } from './components/line-chart/line-chart.component'

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true,
};
@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    GeneralViewComponent,
    StakesViewComponent,
    CourseComparisonViewComponent,
    LevelComparisonViewComponent,
    CommentsSummaryViewComponent,
    LineChartComponent,
  ],
  imports: [
    AppMaterialModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    BrowserModule,
    BrowserModule,
    FormsModule,
    HttpClientModule,
    PerfectScrollbarModule,
  ],
  providers: [
    {
      provide: PERFECT_SCROLLBAR_CONFIG,
      useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}

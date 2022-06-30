import {
  PERFECT_SCROLLBAR_CONFIG,
  PerfectScrollbarConfigInterface,
  PerfectScrollbarModule,
} from 'ngx-perfect-scrollbar';

import { AppComponent } from './pages/app/app.component';
import { AppMaterialModule } from './modules/material.module';
import { AppRoutingModule } from './modules/app-routing.module';
import { BarChartComponent } from './components/bar-chart/bar-chart.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { LineChartComponent } from './components/line-chart/line-chart.component';
import { MatSelectModule } from '@angular/material/select';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { StackedAreaChartComponent } from './components/stacked-area-chart/stacked-area-chart.component';
import { SubjectsFrequencyComponent } from './components/subjects-frequency/subjects-frequency.component';

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true,
};
@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    LineChartComponent,
    BarChartComponent,
    SubjectsFrequencyComponent,
    StackedAreaChartComponent,
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
    MatSelectModule,
    ReactiveFormsModule,
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

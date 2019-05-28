import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { ChartComponent } from './chart/chart.component';

import { HighchartsChartModule } from 'highcharts-angular';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import {
  MatSliderModule,
  MatCheckboxModule,
  MatFormFieldModule,
  MatSelectModule,
  MatDialogModule,
  MatButtonModule,
  MatIconModule,
} from '@angular/material';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ErrorFeedbackComponent } from './feedback/error-feedback/error-feedback.component';
import { HelpFeedbackComponent } from './feedback/help-feedback/help-feedback.component';

@NgModule({
  declarations: [
    AppComponent,
    ChartComponent,
    ErrorFeedbackComponent,
    HelpFeedbackComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    FormsModule,
    HttpClientModule,
    HighchartsChartModule,
    BrowserAnimationsModule,
    MatSliderModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  providers: [],
  entryComponents: [ErrorFeedbackComponent, HelpFeedbackComponent],
  bootstrap: [AppComponent]
})
export class AppModule { }

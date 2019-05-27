import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import * as highcharts from 'highcharts';
import { IStockData } from '../api.service';

export interface IChartInfo {
  minY: number;
  maxY: number;
}

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss']
})
export class ChartComponent implements OnInit {

  public highcharts: typeof highcharts = highcharts;
  public chartOptions: highcharts.Options;
  public initChartHandler = this.initChart.bind(this);

  private thresholdHolder: number;
  @Input()
  public set threshold(value) {
    this.thresholdHolder = value;
    this.updateChart();
  }
  public get threshold() {
    return this.thresholdHolder;
  }

  private seriesHolder: IStockData[];
  @Input()
  public set series(value) {
    this.seriesHolder = value;
    this.updateChart();
  }
  public get series() {
    return this.seriesHolder;
  }

  private chart: highcharts.Chart;

  constructor() { }

  ngOnInit() {
  }

  private setupChart() {
    this.chartOptions = {
      title: {
        text: ''
      },
      chart: {
        zoomType: 'xy',
      },
      xAxis: {
        type: 'datetime'
      },
      yAxis: {
        title: {
          text: 'Value'
        },
        plotLines: [this.getThresholdPlotLine()]
      } as highcharts.AxisOptions,
      series: this.getSeriesData()
    };
  }

  private initChart(chart: highcharts.Chart) {
    this.chart = chart;
  }

  private updateChart() {
    if (!this.chart) {
      this.setupChart();
    } else {
      this.chart.update({
        series: this.getSeriesData(),
        yAxis: {
          plotLines: [
            this.getThresholdPlotLine()
          ]
        } as highcharts.AxisOptions
      });
    }
  }

  private getThresholdPlotLine() {
    if (this.threshold === undefined) {
      return undefined;
    }
    return {
      value: this.threshold,
      color: 'green',
      dashStyle: 'Dash',
      width: 4,
      zIndex: 10000,
      label: {
        text: 'Last quarter minimum'
      }
    } as highcharts.PlotLineOptions;
  }

  private getSeriesData(): highcharts.SeriesLineOptions[] {
    if (!this.series) {
      return;
    }

    const data = this.series.map((s, i) => {
      return {
        name: s.symbol,
        type: 'line',
        negativeColor: '#cacaca',
        threshold: this.threshold || undefined,
        zIndex: i,
        data: s.data.map(d => {
          return [d.date.getTime(), d.value];
        }).sort((a, b) => {
          return a[0] > b[0] ? 1 : -1;
        })
      } as highcharts.SeriesLineOptions;
    });
    return data;
  }
}

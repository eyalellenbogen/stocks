import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import * as highcharts from 'highcharts';
import { IStockData } from '../api.service';
import { Subscription, Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

export interface IChartInfo {
  minY: number;
  maxY: number;
}

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss']
})
export class ChartComponent implements OnInit, OnDestroy {

  public highcharts: typeof highcharts = highcharts;
  public chartOptions: highcharts.Options;
  public initChartHandler = this.initChart.bind(this);

  private thresholdHolder: number;
  @Input()
  public set threshold(value) {
    this.thresholdHolder = value;
    this.updater$.next();
  }
  public get threshold() {
    return this.thresholdHolder;
  }

  private seriesHolder: IStockData[];
  @Input()
  public set series(value) {
    this.seriesHolder = value;
    this.updater$.next();
  }
  public get series() {
    return this.seriesHolder;
  }

  private updater$ = new Subject();
  private chart: highcharts.Chart;
  private subscriptions: Subscription[] = [];

  ngOnInit() {
    this.setupChart();
    this.subscriptions.push(this.updater$.pipe(debounceTime(100)).subscribe(x => this.updateChart()));
  }

  ngOnDestroy() {
    this.subscriptions.forEach(x => x.unsubscribe());
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
          text: 'Price'
        }
      } as highcharts.AxisOptions,
      series: this.getSeriesData()
    };
  }

  private initChart(chart: highcharts.Chart) {
    this.chart = chart;
  }

  private updateChart() {
    this.chart.update({
      yAxis: {
        plotLines: [
          this.getThresholdPlotLine()
        ]
      } as highcharts.AxisOptions
    });
    this.updateSeries();
  }

  private updateSeries() {
    // find series to remove
    const series = this.getSeriesData();
    const newSymbols = series.map(x => x.name);
    const oldSymbols = this.chart.series.map(x => x.name);
    const removeTargets = this.chart.series.filter(x => newSymbols.indexOf(x.name) < 0);
    while (removeTargets.length) {
      removeTargets[0].remove();
      removeTargets.splice(0, 1);
    }

    series.forEach(s => {
      if (oldSymbols.indexOf(s.name) < 0) {
        // add new series
        this.chart.addSeries(s);
      } else {
        // update datapoints of existing
        const updateTarget = this.chart.series.filter(x => x.name === s.name)[0];
        updateTarget.update({ threshold: this.threshold, data: s.data } as highcharts.SeriesLineOptions)
      }
    });
  }

  private getThresholdPlotLine() {
    if (this.threshold === undefined) {
      return undefined;
    }
    return {
      value: this.threshold,
      color: 'green',
      dashStyle: 'Dash',
      width: 2,
      zIndex: 10000,
      label: {
        text: 'Threshold line'
      }
    } as highcharts.PlotLineOptions;
  }

  private getSeriesData(): highcharts.SeriesLineOptions[] {
    if (!this.series) {
      return;
    }
    const series = this.series.map((s, i) => {
      return {
        id: s.symbol,
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

    return series;
  }
}

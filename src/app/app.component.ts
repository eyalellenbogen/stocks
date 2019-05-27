import { Component, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { Subject, Observable, forkJoin } from 'rxjs';
import { debounceTime, map, concatMap } from 'rxjs/operators';
import { ApiService, IStockData, ICompany } from './api.service';

interface ISelectedCompany extends ICompany {
  selected?: boolean;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  private dataRequest$ = new Subject();

  public minValue: number;
  public maxValue: number;
  public step: number;

  public rawThreshold$ = new Subject<number>();
  public threshold$: Observable<number>;

  public companies: ISelectedCompany[];

  public series: IStockData[];

  constructor(private apiService: ApiService) {
    this.init();
  }

  public triggerUpdate() {
    this.dataRequest$.next();
  }

  public updateThreshold(value) {
    this.rawThreshold$.next(value);
  }

  private init() {
    this.initThresholdObservable();
    this.initCompaniesObservable();
    this.initDataObservable();
  }

  private initCompaniesObservable() {
    this.apiService.getCompanies()
      .then(res => {
        this.companies = res;
        this.companies[0].selected = true;
        this.companies[1].selected = true;

        this.triggerUpdate();
      });
  }

  private initDataObservable() {
    const obs = this.dataRequest$.pipe(
      concatMap(() => {
        const arr = this.companies.filter(x => x.selected).map(x => x.symbol);
        const requests = arr.map(x => {
          return this.apiService.getStockData(x, 'close');
        });
        return forkJoin(requests);
      }));

    obs
      .pipe(map(x => {
        return this.companies
          .filter(c => c.selected)
          .map((d, i) => {
            return {
              symbol: d.symbol,
              data: x[i]
            };
          });
      })).subscribe(data => {
        this.series = data;

        this.setValues();
        this.setStep();
        this.updateThreshold((this.maxValue - this.minValue) / 2);
      });
  }

  private initThresholdObservable() {
    this.threshold$ = this.rawThreshold$.pipe(debounceTime(200));
  }

  private setValues() {
    this.setMinAndMaxValues();
  }

  private setStep() {
    const step = (this.maxValue - this.minValue) / 100;
    this.step = Math.round(step * 100) / 100; // round to trim decimals
  }

  private setMinAndMaxValues() {
    const minMax = this.series.map(s => {
      const values = s.data.map(x => x.value);
      return {
        max: Math.max(...values),
        min: Math.min(...values)
      };
    });

    this.minValue = Math.min(...minMax.map(x => x.min));
    this.maxValue = Math.max(...minMax.map(x => x.max));
  }
}

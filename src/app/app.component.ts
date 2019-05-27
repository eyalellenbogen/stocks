import { Component } from '@angular/core';
import { Subject, Observable, forkJoin } from 'rxjs';
import { debounceTime, map, concatMap } from 'rxjs/operators';
import { ApiService, IStockData, ICompany, PriceType } from './api.service';
import { FeedbackService } from './feedback/feedback.service';

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
  public priceTypes: PriceType[];
  public selectedPriceType: PriceType;

  public chartTitle: string;

  public series: IStockData[];

  constructor(private apiService: ApiService, private feedbackService: FeedbackService) {
    this.init();
  }

  public triggerUpdate() {
    this.dataRequest$.next();
  }

  public updateThreshold(value: number) {
    this.rawThreshold$.next(value);
  }

  private init() {
    this.initThresholdObservable();
    this.initCompaniesObservable();
    this.initDataObservable();

    Promise.all([this.initCompaniesObservable(), this.initPriceTypes()])
      .then(() => {
        this.companies[0].selected = true;
        this.selectedPriceType = this.priceTypes[0];
        this.triggerUpdate();
      });
  }

  private initCompaniesObservable() {
    return this.apiService.getCompanies()
      .then(res => {
        this.companies = res;
      });
  }

  private initPriceTypes() {
    return this.apiService.getPriceTypes()
      .then(res => {
        this.priceTypes = res;
      });
  }

  private initDataObservable() {
    this.getRequestObservable()
      .pipe(map(x => {
        return this.companies
          .filter(c => c.selected)
          .map((d, i) => {
            return {
              symbol: d.symbol,
              data: x[i]
            };
          });
      })).subscribe(res => {
        if (res.some(x => !x.data)) {
          this.feedbackService.showError('Error fetching data from server', 'Make sure you you don\'t go over the API limit')
          return;
        }
        this.series = res;
        this.setValues();
      });
  }

  private getRequestObservable() {
    // call all http requests when triggered and forkjoin the responses
    return this.dataRequest$.pipe(
      concatMap(() => {
        const arr = this.companies.filter(x => x.selected).map(x => x.symbol);
        const requests = arr.map(x => {
          return this.apiService.getStockData(x, this.selectedPriceType);
        });
        return forkJoin(requests);
      }));
  }

  private setValues() {
    this.setMinAndMaxValues();
    this.setStep();
    this.updateThreshold(this.minValue + (this.maxValue - this.minValue) / 2);

    this.chartTitle = `Stock Prices (${this.selectedPriceType})`;
  }

  private initThresholdObservable() {
    this.threshold$ = this.rawThreshold$.pipe(debounceTime(200));
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

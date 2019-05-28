import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { of, Observable } from 'rxjs';
import { IStockItem, ICompany, PriceType } from './types';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private baseUrl = 'https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&interval=5min&apikey=6QKX9VV2R090NM01';

  private dataKey = 'Time Series (5min)';
  private valueKeys = {
    open: '1. open',
    high: '2. high',
    low: '3. low',
    close: '4. close'
  };

  private cache: { [key: string]: IStockItem[] } = {};

  constructor(private http: HttpClient) { }

  public getPriceTypes(): Promise<PriceType[]> {
    return Promise.resolve<PriceType[]>(['open', 'close', 'high', 'low']);
  }

  public getCompanies(): Promise<ICompany[]> {
    return Promise.resolve([
      { name: 'Microsoft', symbol: 'MSFT' },
      { name: 'Google', symbol: 'GOOGL' },
      { name: 'Apple', symbol: 'AAPL' },
      { name: 'Amazon', symbol: 'AMZN' },
      { name: 'Facebook', symbol: 'FB' },
    ]);
  }

  public getStockData(symbol: string, value: PriceType): Observable<IStockItem[]> {
    const url = this.baseUrl +
      '&symbol=' + symbol;

    // using cache mainly because the API only allows 5 requests per minute which is highly annoying
    const key = symbol + '_' + value;
    const cachedData = this.cache[key];
    if (cachedData) {
      return of(cachedData);
    }

    // no cache - get from server
    return this.http.get(url)
      .pipe(
        map(res => {
          const data = Object.keys(res[this.dataKey])
            .map(k => {
              return {
                date: new Date(k),
                value: +res[this.dataKey][k][this.valueKeys[value]]
              };
            });
          this.cache[key] = data;
          return data;
        }),
        catchError(err => of(null))
      );
  }
}

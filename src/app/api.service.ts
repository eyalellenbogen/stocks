import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { of, Observable } from 'rxjs';

declare type StockValue = 'high' | 'low' | 'close' | 'open';

export interface IStockItem {
  date: Date;
  value: number;
}

export interface IStockData {
  symbol: string;
  data: IStockItem[];
}

export interface ICompany {
  name: string;
  symbol: string;
}

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

  constructor(private http: HttpClient) { }

  public getValues(): Observable<StockValue[]> {
    return of<StockValue[]>(['open', 'close', 'high', 'low']);
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

  public getStockData(symbol: string, value: StockValue): Observable<IStockItem[]> {
    const url = this.baseUrl +
      '&symbol=' + symbol;
    return this.http.get(url)
      .pipe(
        map(res => {
          return Object.keys(res[this.dataKey])
            .map(k => {
              return {
                date: new Date(k),
                value: +res[this.dataKey][k][this.valueKeys[value]]
              };
            });
        })
      );
  }
}

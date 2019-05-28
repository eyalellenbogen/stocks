
export declare type PriceType = 'high' | 'low' | 'close' | 'open';

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

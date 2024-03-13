export interface ICurrency {
  code: string;
  name: string;
  symbol: string;
  rounding: number;
  name_plural: string;
  symbol_native: string;
  decimal_digits: number;
}
export interface IResponse<T> {
  data?: T;
  message: string;
  statusCode: number;
}
export interface IPagintaion<T> {
  data: T[];
  page: number|null;
  next: number|null;
  previous: number|null;
  totalPages: number|null;
}
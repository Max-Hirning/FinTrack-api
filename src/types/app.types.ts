export interface IResponse<T> {
  data?: T;
  message: string;
  statusCode: number;
}
export interface IPagintaion<T> {
  data: T;
  page: number|null;
  next: number|null;
  previous: number|null;
  totalPages: number|null;
}
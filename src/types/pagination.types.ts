export interface IPagintaion<T> {
  data: T;
  page: number|null;
  next: number|null;
  previous: number|null;
  totalPages: number|null;
}
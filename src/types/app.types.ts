export interface IResponse<T> {
  data?: T;
  message: string;
  statusCode: number;
}
export interface ICustomRequest {
  _id: string;
  role: 'Test'|'Admin'|'User';
}
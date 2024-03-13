import {ISignUp} from './sign-up.types';

export interface ISignInResponse {
  token: string;
  userId: string;
}
export interface ISignIn extends Pick<ISignUp, 'email'|'password'> {}
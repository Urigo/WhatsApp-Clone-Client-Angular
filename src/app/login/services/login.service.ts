import { Injectable } from '@angular/core';
import {User} from '../../../types';

@Injectable()
export class LoginService {

  constructor() { }

  storeAuthHeader(auth: string) {
    localStorage.setItem('Authorization', auth);
  }

  getAuthHeader(): string {
    return localStorage.getItem('Authorization');
  }

  storeUser(user: User) {
    localStorage.setItem('user', JSON.stringify(user));
  }

  getUser(): User {
    return JSON.parse(localStorage.getItem('user'));
  }
}

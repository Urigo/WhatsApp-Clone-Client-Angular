import { Injectable } from '@angular/core';
import {User} from '../../../graphql';

@Injectable()
export class LoginService {

  constructor() { }

  storeAuthHeader(auth: string) {
    localStorage.setItem('Authorization', auth);
  }

  getAuthHeader(): string {
    return localStorage.getItem('Authorization');
  }

  removeAuthHeader() {
    localStorage.removeItem('Authorization');
  }

  storeUser(user: User) {
    localStorage.setItem('user', JSON.stringify(user));
  }

  getUser(): User {
    return JSON.parse(localStorage.getItem('user'));
  }

  removeUser() {
    localStorage.removeItem('user');
  }

  createBase64Auth(username: string, password: string): string {
    return `Basic ${btoa(`${username}:${password}`)}`;
  }
}

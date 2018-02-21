import {Injectable} from '@angular/core';
import {CanActivate, Router} from '@angular/router';
import {LoginService} from './login.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private router: Router,
              private loginService: LoginService) {}

  canActivate() {
    if (this.loginService.getAuthHeader()) {
      return true;
    } else {
      this.router.navigate(['/login']);
      return false;
    }
  }
}

import {Injectable} from '@angular/core';
import {CanActivate, Router} from '@angular/router';
import { AccountsClient } from '@accounts/client';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private router: Router,
              private accountsClient: AccountsClient) {}
    async canActivate() {
      const tokens = await this.accountsClient.refreshSession();
      if (!tokens) {
        this.router.navigateByUrl('/login');
        return false;
      }
      return true;
    }
}

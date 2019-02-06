import {Injectable} from '@angular/core';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Observable, from} from 'rxjs';
import { AccountsClient } from '@accounts/client';
import { switchMap } from 'rxjs/operators';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private accountsClient: AccountsClient) {}
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return from(this.accountsClient.getTokens())
      .pipe(
        switchMap(tokens => {
          if (tokens) {
            request = request.clone({
              setHeaders: {
                'accounts-access-token': tokens.accessToken,
              }
            });
          }
          return next.handle(request);
        })
      );
  }
}

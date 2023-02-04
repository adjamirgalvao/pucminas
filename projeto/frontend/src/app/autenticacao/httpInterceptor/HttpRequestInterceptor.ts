import { TokenService } from '../services/token/token.service';
import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HTTP_INTERCEPTORS, HttpErrorResponse } from '@angular/common/http';

import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';


@Injectable()
//https://blog.angular-university.io/angular-jwt-authentication/
//https://github.com/bezkoder/angular-15-refresh-token/blob/master/src/app/_helpers/http.interceptor.ts aqui como fazer no angular 15 o interceptor
export class HttpRequestInterceptor implements HttpInterceptor {
 
  constructor(
    private tokenService : TokenService
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.tokenService.getToken();

    if (token) {
        const cloned = req.clone({headers: req.headers.set("Authorization","Bearer " + token)});

        return next.handle(cloned);
    }
    else {
        return next.handle(req);
    }
  }
}

export const httpInterceptorProviders = [
  { provide: HTTP_INTERCEPTORS, useClass: HttpRequestInterceptor, multi: true },
];